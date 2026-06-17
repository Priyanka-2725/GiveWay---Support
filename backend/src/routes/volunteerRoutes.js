const router = require('express').Router();
const volunteerController = require('../controllers/volunteerController');
const { authenticateUser } = require('../middleware/authenticateUser');
const { requireVerifiedEmail } = require('../middleware/requireVerifiedEmail');

router.get('/', authenticateUser, volunteerController.listVolunteerRequests);
router.post('/:ngoId', authenticateUser, requireVerifiedEmail, volunteerController.createVolunteerRequest);
router.patch('/:id/status', authenticateUser, requireVerifiedEmail, volunteerController.updateVolunteerRequestStatus);

module.exports = router;
