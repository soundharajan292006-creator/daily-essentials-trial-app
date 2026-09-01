const db = require('../config/db');

// Get user wishlist
const getWishlist = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
        w.id AS wishlist_id,
        p.*
       FROM wishlist w
       JOIN products p
         ON w.product_id = p.product_id
       WHERE w.user_id = $1
       ORDER BY w.id DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Add product to wishlist
const addToWishlist = async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      res.status(400);
      throw new Error('Invalid product');
    }

    const product = await db.query(
      `SELECT product_id
       FROM products
       WHERE product_id = $1`,
      [productId]
    );

    if (product.rows.length === 0) {
      res.status(404);
      throw new Error('Product not found');
    }

    const checkExist = await db.query(
      `SELECT *
       FROM wishlist
       WHERE user_id = $1
       AND product_id = $2`,
      [req.user.id, productId]
    );

    if (checkExist.rows.length > 0) {
      res.status(400);
      throw new Error('Product already in wishlist');
    }

    const result = await db.query(
      `INSERT INTO wishlist
       (user_id, product_id)
       VALUES ($1, $2)
       RETURNING *`,
      [req.user.id, productId]
    );

    res.status(201).json({
      success: true,
      message: 'Added to wishlist',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      res.status(400);
      throw new Error('Invalid product');
    }

    const result = await db.query(
      `DELETE FROM wishlist
       WHERE user_id = $1
       AND product_id = $2
       RETURNING *`,
      [req.user.id, productId]
    );

    if (result.rows.length === 0) {
      res.status(404);
      throw new Error('Product not found in wishlist');
    }

    res.json({
      success: true,
      message: 'Removed from wishlist'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};