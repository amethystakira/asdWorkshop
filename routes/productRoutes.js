const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { cacheMiddleware, invalidateCacheMiddleware } = require('../middleware/cacheMiddleware');

// Route → Middleware → Controller → Service → Database

// GET routes with caching middleware
router.get('/', cacheMiddleware(), productController.getAllProducts);
router.get('/:id', cacheMiddleware(), productController.getProductById);

// Data modification routes with cache invalidation middleware
router.post('/', invalidateCacheMiddleware, productController.createProduct);
router.put('/:id', invalidateCacheMiddleware, productController.updateProduct);
router.patch('/:id', invalidateCacheMiddleware, productController.patchProduct);
router.delete('/:id', invalidateCacheMiddleware, productController.deleteProduct);

module.exports = router;
