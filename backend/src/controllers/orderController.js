const db = require('../config/db');

// Create new order
const createOrder = async (req, res, next) => {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const {
      payment_method,
      shipping_address,
      address,
      address_id
    } = req.body;

    // Get cart items
    const cartRes = await client.query(
      `SELECT *
       FROM cart
       WHERE user_id = $1`,
      [req.user.id]
    );

    const cart = cartRes.rows;

    if (cart.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    let totalAmount = 0;

    // Verify products and stock
    for (const item of cart) {
      const productRes = await client.query(
        `SELECT *
         FROM products
         WHERE product_id = $1`,
        [item.product_id]
      );

      const product = productRes.rows[0];

      if (!product) {
        res.status(404);
        throw new Error(
          `Product ${item.product_id} not found`
        );
      }

      const quantity = Number(item.quantity);

      const availableStock =
        item.item_type === 'trial'
          ? Number(product.trial_stock || 0)
          : Number(product.stock || 0);

      if (availableStock < quantity) {
        res.status(400);
        throw new Error(
          `Not enough stock for ${product.product_name}`
        );
      }

      const price =
        item.item_type === 'trial'
          ? Number(product.trial_price || 0)
          : Number(product.price || 0);

      item.price = price;

      totalAmount += price * quantity;
    }

    // Delivery fee
    const deliveryFee =
      totalAmount > 500 ? 0 : 50;

    totalAmount += deliveryFee;

    // Shipping address
    let shippingAddress =
      shipping_address ||
      address ||
      address_id ||
      'Address not provided';

    if (typeof shippingAddress === 'object') {
      shippingAddress = JSON.stringify(shippingAddress);
    }

    shippingAddress = String(shippingAddress);

    // Payment status
    const paymentStatus =
      payment_method === 'cod'
        ? 'pending'
        : 'pending';

    // Create order
    const orderRes = await client.query(
      `INSERT INTO orders
        (
          user_id,
          total_amount,
          order_status,
          payment_status,
          shipping_address
        )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        req.user.id,
        totalAmount,
        'confirmed',
        paymentStatus,
        shippingAddress
      ]
    );

    const order = orderRes.rows[0];

    // Insert order items
    for (const item of cart) {
      await client.query(
        `INSERT INTO order_items
          (
            order_id,
            product_id,
            quantity,
            price
          )
         VALUES ($1, $2, $3, $4)`,
        [
          order.order_id,
          item.product_id,
          item.quantity,
          item.price
        ]
      );

      // Reduce stock
      if (item.item_type === 'trial') {
        await client.query(
          `UPDATE products
           SET trial_stock = trial_stock - $1
           WHERE product_id = $2`,
          [
            item.quantity,
            item.product_id
          ]
        );
      } else {
        await client.query(
          `UPDATE products
           SET stock = stock - $1
           WHERE product_id = $2`,
          [
            item.quantity,
            item.product_id
          ]
        );
      }
    }

    // Clear cart
    await client.query(
      `DELETE FROM cart
       WHERE user_id = $1`,
      [req.user.id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);

  } finally {
    client.release();
  }
};


// Get logged-in user's orders
const getMyOrders = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
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


// Get order by ID
const getOrderById = async (req, res, next) => {
  try {
    const orderRes = await db.query(
      `SELECT *
       FROM orders
       WHERE order_id = $1`,
      [req.params.id]
    );

    const order = orderRes.rows[0];

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (
      order.user_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error(
        'Not authorized to view this order'
      );
    }

    const itemsRes = await db.query(
      `SELECT
        oi.*,
        p.product_name,
        p.brand,
        p.image_url
       FROM order_items oi
       JOIN products p
         ON oi.product_id = p.product_id
       WHERE oi.order_id = $1`,
      [order.order_id]
    );

    order.items = itemsRes.rows;

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    next(error);
  }
};


// Get all orders - Admin
const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
         o.*,
         u.full_name AS user_name
       FROM orders o
       LEFT JOIN users u
         ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    next(error);
  }
};


// Update order status - Admin
const updateOrderStatus = async (
  req,
  res,
  next
) => {
  try {
    const { order_status } = req.body;

    const allowed = [
      'confirmed',
      'packed',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ];

    if (!allowed.includes(order_status)) {
      res.status(400);
      throw new Error('Invalid order status');
    }

    const result = await db.query(
      `UPDATE orders
       SET order_status = $1
       WHERE order_id = $2
       RETURNING *`,
      [
        order_status,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      res.status(404);
      throw new Error('Order not found');
    }

    res.json({
      success: true,
      message: 'Order status updated',
      data: result.rows[0]
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatus
};