const { z } = require('zod');
const { prisma } = require('../prisma/client');
const { asyncHandler, toPublicUser } = require('../utils/http');

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  followingNgoIds: z.array(z.string()).optional(),
  recentSearchTerms: z.array(z.string()).optional(),
});

const updateUser = asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id && !['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: updateSchema.parse(req.body),
  });
  res.json({ user: toPublicUser(user) });
});

module.exports = { updateUser };
