const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
// GET /api/products - Get all products
router.get('/', productController.getAllProducts);

// GET /api/products/:id - Get single product
router.get('/:id', productController.getProductById);

// Protected routes (Admin only)
// POST /api/products - Create product
router.post('/', authMiddleware, upload.single('image'), productController.createProduct);

// PUT /api/products/:id - Update product
router.put('/:id', authMiddleware, upload.single('image'), productController.updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', authMiddleware, productController.deleteProduct);

// PATCH /api/products/:id/add-stock - Add stock
router.patch('/:id/add-stock', authMiddleware, productController.addStock);

// PATCH /api/products/:id/sell - Sell product
router.patch('/:id/sell', authMiddleware, productController.sellProduct);

module.exports = router;
