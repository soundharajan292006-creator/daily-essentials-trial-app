const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, deleteCartItem, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCart)
  .post(protect, addToCart)
  .delete(protect, clearCart);

router.route('/:id')
  .put(protect, updateCartItem)
  .delete(protect, deleteCartItem);

module.exports = router;
