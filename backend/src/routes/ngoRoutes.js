const router = require('express').Router();
const ngoController = require('../controllers/ngoController');
const { authenticateUser } = require('../middleware/authenticateUser');
const { requireVerifiedEmail } = require('../middleware/requireVerifiedEmail');

router.get('/', ngoController.listNgos);
router.get('/:id', ngoController.getNgo);
router.post('/', authenticateUser, requireVerifiedEmail, ngoController.createNgo);
router.patch('/:id', authenticateUser, requireVerifiedEmail, ngoController.updateNgo);
router.delete('/:id', authenticateUser, ngoController.deleteNgo);

module.exports = router;
