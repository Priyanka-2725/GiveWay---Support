const { prisma } = require('../prisma/client');
const { asyncHandler } = require('../utils/http');

const listNotifications = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user.id;
  if (userId !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ notifications });
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  if (notification.userId !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }

  await prisma.notification.update({ where: { id: req.params.id }, data: { read: true } });
  res.json({ success: true });
});

module.exports = { listNotifications, markNotificationAsRead };
