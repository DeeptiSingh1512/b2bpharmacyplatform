const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const orderController = require('../controllers/orderController');

router.post('/orders', authMiddleware, orderController.createOrder);
router.get('/orders', authMiddleware, orderController.getOrders);
router.get('/orders/:id', authMiddleware, orderController.getOrderById);
router.put('/orders/:id/status', authMiddleware, orderController.updateOrderStatus);

module.exports = router;
