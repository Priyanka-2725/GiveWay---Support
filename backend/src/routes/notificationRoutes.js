const router = require('express').Router();
const notificationController = require('../controllers/notificationController');
const { authenticateUser } = require('../middleware/authenticateUser');

router.get('/:userId?', authenticateUser, notificationController.listNotifications);
router.patch('/:id/read', authenticateUser, notificationController.markNotificationAsRead);

module.exports = router;
