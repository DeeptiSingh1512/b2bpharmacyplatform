const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const invoiceController = require('../controllers/invoiceController');

router.get('/:orderId', authMiddleware, invoiceController.generateInvoice);

module.exports = router;
