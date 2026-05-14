const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createOrder, getAllOrders, getMerchantOrders, getRiderOrders,
  assignRider, updateOrderStatus, trackOrder, getDashboardStats
} = require('../controllers/ordersController');

// Public
router.get('/track/:trackingId', trackOrder);

// Admin
router.get('/dashboard/stats', auth(['admin','super_admin']), getDashboardStats);
router.get('/', auth(['admin','super_admin']), getAllOrders);
router.put('/:orderId/assign', auth(['admin','super_admin']), assignRider);

// Merchant
router.post('/', auth(['merchant']), createOrder);
router.get('/merchant/my', auth(['merchant']), getMerchantOrders);

// Rider
router.get('/rider/my', auth(['rider']), getRiderOrders);
router.put('/:orderId/status', auth(['rider']), updateOrderStatus);

module.exports = router;