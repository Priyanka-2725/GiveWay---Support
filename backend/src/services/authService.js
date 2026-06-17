const bcrypt = require('bcrypt');
const { z } = require('zod');
const { prisma } = require('../prisma/client');
const { env } = require('../config/env');
const { signAccessToken, generateOpaqueToken, hashToken } = require('../utils/tokens');
const { sendVerificationEmail, sendPasswordResetEmail } = require('./emailService');

const credentialsSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8),
});

const registerSchema = credentialsSchema.extend({
  name: z.string().min(1).optional(),
  role: z.enum(['user', 'ngo_admin']).optional(),
});

async function register(input) {
  const data = registerSchema.parse(input);
  const passwordHash = await bcrypt.hash(data.password, 12);
  const role = data.email === env.superadminEmail ? 'superadmin' : data.role || 'user';

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash,
      role,
      emailVerified: role === 'superadmin',
    },
  });

  if (!user.emailVerified) {
    const { token, tokenHash } = generateOpaqueToken();
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
    await sendVerificationEmail(user, token);
  }

  return { user, token: signAccessToken(user) };
}

async function login(input) {
  const data = credentialsSchema.parse(input);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  const valid = user ? await bcrypt.compare(data.password, user.passwordHash) : false;

  if (!valid) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  if (user.email === env.superadminEmail && user.role !== 'superadmin') {
    await prisma.user.update({ where: { id: user.id }, data: { role: 'superadmin' } });
    user.role = 'superadmin';
  }

  return { user, token: signAccessToken(user) };
}

async function verifyEmail(token) {
  const tokenHash = hashToken(token);
  const record = await prisma.verificationToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    const err = new Error('Invalid or expired verification token');
    err.status = 400;
    throw err;
  }

  const user = await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: true },
  });
  await prisma.verificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return user;
}

async function forgotPassword(email) {
  const parsedEmail = z.string().email().parse(email).toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: parsedEmail } });
  if (!user) return;

  const { token, tokenHash } = generateOpaqueToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    },
  });
  await sendPasswordResetEmail(user, token);
}

async function resetPassword({ token, password }) {
  const newPassword = z.string().min(8).parse(password);
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    const err = new Error('Invalid or expired reset token');
    err.status = 400;
    throw err;
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash: await bcrypt.hash(newPassword, 12) },
  });
  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });
}

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword };
