const router = require('express').Router();
const feedController = require('../controllers/feedController');
const { authenticateUser } = require('../middleware/authenticateUser');

router.get('/my', authenticateUser, feedController.getMyFeed);

module.exports = router;
