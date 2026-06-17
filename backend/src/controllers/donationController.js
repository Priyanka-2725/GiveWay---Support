const { z } = require('zod');
const { prisma } = require('../prisma/client');
const { asyncHandler, serializeDonation } = require('../utils/http');

const listDonations = asyncHandler(async (req, res) => {
  const { userId, ngoId, limit } = req.query;
  const donations = await prisma.donation.findMany({
    where: { userId: userId ? String(userId) : undefined, ngoId: ngoId ? String(ngoId) : undefined },
    include: { user: true, ngo: true },
    orderBy: { createdAt: 'desc' },
    take: limit ? Number(limit) : undefined,
  });
  res.json({ donations: donations.map(serializeDonation) });
});

const createDonation = asyncHandler(async (req, res) => {
  const data = z.object({
    amount: z.coerce.number().positive(),
    ngoId: z.string().min(1),
    message: z.string().optional(),
  }).parse(req.body);

  const donation = await prisma.$transaction(async (tx) => {
    const created = await tx.donation.create({
      data: { userId: req.user.id, ngoId: data.ngoId, amount: data.amount, message: data.message },
      include: { user: true, ngo: true },
    });
    await tx.ngo.update({
      where: { id: data.ngoId },
      data: { raisedAmount: { increment: data.amount } },
    });
    await tx.feedItem.create({
      data: { userId: req.user.id, type: 'donation', title: 'Donation sent', message: `You donated ${data.amount} to ${created.ngo.name}.` },
    });
    return created;
  });

  res.status(201).json({ donation: serializeDonation(donation) });
});

module.exports = { listDonations, createDonation };
