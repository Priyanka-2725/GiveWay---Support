const router = require('express').Router();
const userController = require('../controllers/userController');
const { authenticateUser } = require('../middleware/authenticateUser');

router.patch('/:id', authenticateUser, userController.updateUser);

module.exports = router;
