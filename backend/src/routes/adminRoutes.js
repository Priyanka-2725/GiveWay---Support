const router = require('express').Router();
const adminController = require('../controllers/adminController');
const ngoController = require('../controllers/ngoController');
const { authenticateUser } = require('../middleware/authenticateUser');
const { authorizeRoles } = require('../middleware/authorizeRoles');

router.use(authenticateUser);
router.post('/admins', authorizeRoles('superadmin'), adminController.createAdmin);
router.delete('/admins/:userId', authorizeRoles('superadmin'), adminController.removeAdmin);
router.patch('/ngos/:ngoId/verify', authorizeRoles('admin', 'superadmin'), adminController.verifyNgo);
router.delete('/ngos/:id', authorizeRoles('superadmin'), ngoController.deleteNgo);

module.exports = router;
