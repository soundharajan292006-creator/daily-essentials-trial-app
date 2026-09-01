const express = require('express');

const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const {
  getProductReviews,
  createReview
} = require('../controllers/reviewController');

router
  .route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router
  .route('/:productId/reviews')
  .get(getProductReviews)
  .post(protect, createReview);

module.exports = router;