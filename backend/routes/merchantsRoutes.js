const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllMerchants, createMerchant, updateMerchant, recordPayout, getMerchantLedger, getZones } = require('../controllers/merchantsController');

router.get('/zones', getZones); // Public - for order creation
router.get('/', auth(['admin','super_admin']), getAllMerchants);
router.post('/', auth(['admin','super_admin']), createMerchant);
router.put('/:merchantId', auth(['admin','super_admin']), updateMerchant);
router.post('/:merchantId/payout', auth(['admin','super_admin']), recordPayout);
router.get('/me/ledger', auth(['merchant']), getMerchantLedger);

module.exports = router;