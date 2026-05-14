const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllRiders, createRider, updateRider, recordDeposit, getRiderProfile, toggleStatus } = require('../controllers/ridersController');

router.get('/', auth(['admin','super_admin']), getAllRiders);
router.post('/', auth(['admin','super_admin']), createRider);
router.put('/:riderId', auth(['admin','super_admin']), updateRider);
router.post('/:riderId/deposit', auth(['admin','super_admin']), recordDeposit);
router.get('/me/profile', auth(['rider']), getRiderProfile);
router.post('/me/toggle-status', auth(['rider']), toggleStatus);

module.exports = router;