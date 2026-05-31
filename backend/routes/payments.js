const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const creditController = require('../controllers/creditController');
const paymentController = require('../controllers/paymentController');

// Credit routes - specific routes BEFORE dynamic ones
router.post('/credit/request', authMiddleware, creditController.requestCredit);
router.post('/credit', authMiddleware, creditController.setCredit);
router.get('/credit/:retailerId', authMiddleware, creditController.getCredit);

// Payment routes
router.post('/payments', authMiddleware, paymentController.createPayment);
router.get('/payments', authMiddleware, paymentController.getPayments);

module.exports = router;