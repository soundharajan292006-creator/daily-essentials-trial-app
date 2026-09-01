const db = require('../config/db');

// Get user cart
const getCart = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
        c.cart_id AS cart_item_id,
        c.quantity,
        c.item_type,
        c.unit_price,
        p.*
       FROM cart c
       JOIN products p
         ON c.product_id = p.product_id
       WHERE c.user_id = $1
       ORDER BY c.cart_id DESC`,
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

// Add item to cart
const addToCart = async (req, res, next) => {
  try {
    const productId = Number(req.body.product_id);
    const itemType = req.body.item_type;
    const quantity = Number(req.body.quantity);

    if (
      !Number.isInteger(productId) ||
      !['trial', 'full'].includes(itemType) ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      res.status(400);
      throw new Error('Invalid product, item type, or quantity');
    }

    const productRes = await db.query(
      `SELECT *
       FROM products
       WHERE product_id = $1`,
      [productId]
    );

    const product = productRes.rows[0];

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const availableStock =
      itemType === 'trial'
        ? Number(product.trial_stock || 0)
        : Number(product.stock || 0);

    if (availableStock < quantity) {
      res.status(400);
      throw new Error('Not enough stock available');
    }

    const unitPrice =
      itemType === 'trial'
        ? Number(product.trial_price || 0)
        : Number(product.price || 0);

    const existingItemRes = await db.query(
      `SELECT *
       FROM cart
       WHERE user_id = $1
       AND product_id = $2
       AND item_type = $3`,
      [req.user.id, productId, itemType]
    );

    let result;

    if (existingItemRes.rows.length > 0) {
      const currentQty = Number(
        existingItemRes.rows[0].quantity
      );

      const newQty = currentQty + quantity;

      if (availableStock < newQty) {
        res.status(400);
        throw new Error(
          'Not enough stock available for combined quantity'
        );
      }

      result = await db.query(
        `UPDATE cart
         SET quantity = $1,
             unit_price = $2
         WHERE cart_id = $3
         AND user_id = $4
         RETURNING *`,
        [
          newQty,
          unitPrice,
          existingItemRes.rows[0].cart_id,
          req.user.id
        ]
      );
    } else {
      result = await db.query(
        `INSERT INTO cart
          (user_id, product_id, item_type, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          req.user.id,
          productId,
          itemType,
          quantity,
          unitPrice
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update cart item
const updateCartItem = async (req, res, next) => {
  try {
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      res.status(400);
      throw new Error('Invalid quantity');
    }

    const checkItem = await db.query(
      `SELECT *
       FROM cart
       WHERE cart_id = $1
       AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (checkItem.rows.length === 0) {
      res.status(404);
      throw new Error('Cart item not found');
    }

    const item = checkItem.rows[0];

    const productRes = await db.query(
      `SELECT *
       FROM products
       WHERE product_id = $1`,
      [item.product_id]
    );

    const product = productRes.rows[0];

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const availableStock =
      item.item_type === 'trial'
        ? Number(product.trial_stock || 0)
        : Number(product.stock || 0);

    if (availableStock < quantity) {
      res.status(400);
      throw new Error('Not enough stock available');
    }

    const result = await db.query(
      `UPDATE cart
       SET quantity = $1
       WHERE cart_id = $2
       AND user_id = $3
       RETURNING *`,
      [
        quantity,
        req.params.id,
        req.user.id
      ]
    );

    res.json({
      success: true,
      message: 'Cart updated',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete cart item
const deleteCartItem = async (req, res, next) => {
  try {
    const result = await db.query(
      `DELETE FROM cart
       WHERE cart_id = $1
       AND user_id = $2
       RETURNING *`,
      [
        req.params.id,
        req.user.id
      ]
    );

    if (result.rows.length === 0) {
      res.status(404);
      throw new Error('Cart item not found');
    }

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    next(error);
  }
};

// Clear entire cart
const clearCart = async (req, res, next) => {
  try {
    await db.query(
      `DELETE FROM cart
       WHERE user_id = $1`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart
};