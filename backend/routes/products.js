const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { validate, productSchema, importSchema } = require('../middleware/validate');
const productController = require('../controllers/productController');
const inventoryController = require('../controllers/inventoryController');

// Public
router.get('/products', productController.getAllProducts);

// Protected CRUD with schema validation
router.post('/products', authMiddleware, validate(productSchema), productController.createProduct);
router.put('/products/:id', authMiddleware, validate(productSchema), productController.updateProduct);
router.delete('/products/:id', authMiddleware, productController.deleteProduct);

// Bulk import / export
router.post('/products/import', authMiddleware, validate(importSchema), productController.importProducts);
router.get('/products/export', authMiddleware, productController.exportProducts);

// Inventory batches
router.post('/inventory/batch', authMiddleware, inventoryController.addBatch);
router.get('/inventory/batches/:productId', authMiddleware, inventoryController.getBatches);

module.exports = router;
