const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const returnController = require('../controllers/returnController');

router.post('/', authMiddleware, returnController.createReturn);
router.get('/', authMiddleware, returnController.getReturns);
router.put('/:id/status', authMiddleware, returnController.updateReturnStatus);

module.exports = router;
