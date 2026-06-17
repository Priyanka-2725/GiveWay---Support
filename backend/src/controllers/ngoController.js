const { z } = require('zod');
const { prisma } = require('../prisma/client');
const { asyncHandler, serializeNgo } = require('../utils/http');
const { canManageNgo, isNgoOwner } = require('../services/ngoAccessService');

const ngoSchema = z.object({
  name: z.string().min(1),
  shortDescription: z.string().optional(),
  description: z.string().min(1),
  cause: z.string().min(1),
  city: z.string().optional(),
  state: z.string().min(1),
  goalAmount: z.coerce.number().nonnegative().default(0),
  image: z.string().optional(),
  icon: z.string().optional(),
  contactEmail: z.string().email().optional(),
});

const listNgos = asyncHandler(async (req, res) => {
  const { verified, limit, cause, state } = req.query;
  const ngos = await prisma.ngo.findMany({
    where: {
      verified: verified === undefined ? undefined : verified === 'true',
      cause: cause && cause !== 'all' ? String(cause) : undefined,
      state: state && state !== 'all' ? String(state) : undefined,
    },
    include: { members: true },
    orderBy: { createdAt: 'desc' },
    take: limit ? Number(limit) : undefined,
  });
  res.json({ ngos: ngos.map(serializeNgo) });
});

const getNgo = asyncHandler(async (req, res) => {
  const ngo = await prisma.ngo.findUnique({ where: { id: req.params.id }, include: { members: true } });
  if (!ngo) return res.status(404).json({ message: 'NGO not found' });
  res.json({ ngo: serializeNgo(ngo) });
});

const createNgo = asyncHandler(async (req, res) => {
  const data = ngoSchema.parse(req.body);
  const ngo = await prisma.$transaction(async (tx) => {
    const created = await tx.ngo.create({ data: { ...data, goalAmount: data.goalAmount } });
    await tx.ngoMember.create({
      data: { userId: req.user.id, ngoId: created.id, membershipRole: 'owner' },
    });
    if (req.user.role === 'user') {
      await tx.user.update({ where: { id: req.user.id }, data: { role: 'ngo_admin' } });
    }
    return tx.ngo.findUnique({ where: { id: created.id }, include: { members: true } });
  });
  res.status(201).json({ ngo: serializeNgo(ngo) });
});

const updateNgo = asyncHandler(async (req, res) => {
  const allowed = await canManageNgo(req.user, req.params.id);
  if (!allowed) return res.status(403).json({ message: 'Insufficient permissions' });

  const data = ngoSchema.partial().extend({ verified: z.boolean().optional(), members: z.record(z.enum(['owner', 'manager'])).optional() }).parse(req.body);
  const { members, ...ngoData } = data;

  const ngo = await prisma.$transaction(async (tx) => {
    const updated = await tx.ngo.update({ where: { id: req.params.id }, data: ngoData });
    if (members && await isNgoOwner(req.user, req.params.id)) {
      await tx.ngoMember.deleteMany({ where: { ngoId: req.params.id } });
      await Promise.all(Object.entries(members).map(([userId, membershipRole]) =>
        tx.ngoMember.create({ data: { userId, ngoId: req.params.id, membershipRole } })
      ));
    }
    return tx.ngo.findUnique({ where: { id: updated.id }, include: { members: true } });
  });
  res.json({ ngo: serializeNgo(ngo) });
});

const deleteNgo = asyncHandler(async (req, res) => {
  if (!['superadmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Only superadmin can delete NGOs' });
  }
  await prisma.ngo.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

module.exports = { listNgos, getNgo, createNgo, updateNgo, deleteNgo };
