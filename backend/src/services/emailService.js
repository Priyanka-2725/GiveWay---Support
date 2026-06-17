const nodemailer = require('nodemailer');
const { env } = require('../config/env');

function createTransporter() {
  if (!env.smtp.host || !env.smtp.user) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
}

async function sendMail({ to, subject, text }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.info(`[mail disabled] ${subject} -> ${to}: ${text}`);
    return;
  }

  await transporter.sendMail({ from: env.smtp.from, to, subject, text });
}

async function sendVerificationEmail(user, token) {
  const url = `${env.clientUrl}/verify-email?token=${token}`;
  await sendMail({
    to: user.email,
    subject: 'Verify your GiveWay email',
    text: `Verify your email to activate protected GiveWay features: ${url}`,
  });
}

async function sendPasswordResetEmail(user, token) {
  const url = `${env.clientUrl}/reset-password?token=${token}`;
  await sendMail({
    to: user.email,
    subject: 'Reset your GiveWay password',
    text: `Reset your GiveWay password using this secure link: ${url}`,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
