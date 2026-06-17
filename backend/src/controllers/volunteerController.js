const { z } = require('zod');
const { prisma } = require('../prisma/client');
const { asyncHandler } = require('../utils/http');
const { canManageNgo } = require('../services/ngoAccessService');

function serializeRequest(request) {
  return {
    ...request,
    ngoName: request.ngo?.name,
    userName: request.user?.name || request.user?.email,
    userEmail: request.user?.email,
  };
}

const listVolunteerRequests = asyncHandler(async (req, res) => {
  const { userId, ngoId } = req.query;
  const requests = await prisma.volunteerRequest.findMany({
    where: { userId: userId ? String(userId) : undefined, ngoId: ngoId ? String(ngoId) : undefined },
    include: { user: true, ngo: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ volunteerRequests: requests.map(serializeRequest) });
});

const createVolunteerRequest = asyncHandler(async (req, res) => {
  const data = z.object({
    ngoId: z.string().min(1),
    skills: z.string().optional(),
    availability: z.string().optional(),
    message: z.string().optional(),
  }).parse({ ...req.body, ngoId: req.params.ngoId || req.body.ngoId });

  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.volunteerRequest.create({
      data: { userId: req.user.id, ngoId: data.ngoId, skills: data.skills, availability: data.availability, message: data.message },
      include: { user: true, ngo: true },
    });
    await tx.notification.create({
      data: { userId: req.user.id, title: 'Volunteer request submitted', message: `Your volunteer application for ${created.ngo.name} has been submitted.` },
    });
    await tx.feedItem.create({
      data: { userId: req.user.id, type: 'volunteer', title: 'Volunteer request', message: `You applied to volunteer with ${created.ngo.name}.` },
    });
    return created;
  });

  res.status(201).json({ volunteerRequest: serializeRequest(request) });
});

const updateVolunteerRequestStatus = asyncHandler(async (req, res) => {
  const { status } = z.object({ status: z.enum(['accepted', 'rejected']) }).parse(req.body);
  const existing = await prisma.volunteerRequest.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: 'Volunteer request not found' });
  if (!await canManageNgo(req.user, existing.ngoId)) return res.status(403).json({ message: 'Insufficient permissions' });

  const request = await prisma.volunteerRequest.update({
    where: { id: req.params.id },
    data: { status },
    include: { user: true, ngo: true },
  });
  await prisma.notification.create({
    data: { userId: request.userId, title: 'Volunteer request updated', message: `Your volunteer application for ${request.ngo.name} has been ${status}.` },
  });

  res.json({ volunteerRequest: serializeRequest(request) });
});

module.exports = { listVolunteerRequests, createVolunteerRequest, updateVolunteerRequestStatus };
