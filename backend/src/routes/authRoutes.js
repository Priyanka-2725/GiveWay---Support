const router = require('express').Router();
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/authenticateUser');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticateUser, authController.me);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
