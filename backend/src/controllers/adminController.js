const { z } = require('zod');
const { prisma } = require('../prisma/client');
const { asyncHandler, toPublicUser } = require('../utils/http');

const createAdmin = asyncHandler(async (req, res) => {
  const { userId } = z.object({ userId: z.string().min(1) }).parse(req.body);
  const user = await prisma.user.update({ where: { id: userId }, data: { role: 'admin' } });
  res.json({ user: toPublicUser(user) });
});

const removeAdmin = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({ where: { id: req.params.userId }, data: { role: 'user' } });
  res.json({ user: toPublicUser(user) });
});

const verifyNgo = asyncHandler(async (req, res) => {
  const ngo = await prisma.ngo.update({ where: { id: req.params.ngoId }, data: { verified: true } });
  res.json({ ngo });
});

module.exports = { createAdmin, removeAdmin, verifyNgo };
