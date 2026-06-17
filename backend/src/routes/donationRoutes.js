const router = require('express').Router();
const donationController = require('../controllers/donationController');
const { authenticateUser } = require('../middleware/authenticateUser');
const { requireVerifiedEmail } = require('../middleware/requireVerifiedEmail');

router.get('/', authenticateUser, donationController.listDonations);
router.post('/', authenticateUser, requireVerifiedEmail, donationController.createDonation);

module.exports = router;
