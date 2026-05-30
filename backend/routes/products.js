const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const productController = require('../controllers/productController');
const inventoryController = require('../controllers/inventoryController');

router.get('/products', productController.getAllProducts);
router.post('/products', authMiddleware, productController.createProduct);
router.put('/products/:id', authMiddleware, productController.updateProduct);
router.delete('/products/:id', authMiddleware, productController.deleteProduct);

router.post('/inventory/batch', authMiddleware, inventoryController.addBatch);
router.get('/inventory/batches/:productId', authMiddleware, inventoryController.getBatches);

module.exports = router;
