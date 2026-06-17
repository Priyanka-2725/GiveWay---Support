const { prisma } = require('../prisma/client');
const { asyncHandler } = require('../utils/http');

const getMyFeed = asyncHandler(async (req, res) => {
  const feedItems = await prisma.feedItem.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ feedItems });
});

module.exports = { getMyFeed };
