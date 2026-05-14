const express = require('express');
const router = express.Router();
const { adminLogin, merchantLogin, riderLogin } = require('../controllers/authController');

router.post('/admin/login', adminLogin);
router.post('/merchant/login', merchantLogin);
router.post('/rider/login', riderLogin);

module.exports = router;