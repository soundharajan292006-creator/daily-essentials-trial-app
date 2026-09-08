const db = require('../config/db');

// @desc    Create a trial request
// @route   POST /api/trials
// @access  Private
const createTrialRequest = async (req, res, next) => {
  try {
    const productId = Number(req.body.product_id);
    const quantity = Number(req.body.quantity ?? 1);

    if (!Number.isInteger(productId) || productId < 1) {
      res.status(400);
      throw new Error('Invalid product ID');
    }

    // Current trial_requests schema stores one product per request.
    if (!Number.isInteger(quantity) || quantity !== 1) {
      res.status(400);
      throw new Error('Only one product per trial request is supported');
    }

    const productResult = await db.query(
      `SELECT product_id, product_name, trial_stock, is_trial_available
       FROM products
       WHERE product_id = $1`,
      [productId]
    );

    const product = productResult.rows[0];

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    if (!product.is_trial_available) {
      res.status(400);
      throw new Error('Trial is not available for this product');
    }

    if (Number(product.trial_stock || 0) < 1) {
      res.status(400);
      throw new Error('Not enough trial stock');
    }

    const result = await db.query(
      `INSERT INTO trial_requests
        (user_id, product_id, status)
       VALUES ($1, $2, $3)
       RETURNING trial_id, user_id, product_id, status, requested_at`,
      [req.user.id, productId, 'pending']
    );

    res.status(201).json({
      success: true,
      message: 'Trial request created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's trial requests
// @route   GET /api/trials/my
// @access  Private
const getMyTrialRequests = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
         tr.trial_id,
         tr.user_id,
         tr.product_id,
         tr.status,
         tr.requested_at,
         tr.requested_at AS created_at,
         p.product_name,
         p.brand,
         p.image_url,
         p.trial_price
       FROM trial_requests tr
       LEFT JOIN products p
         ON p.product_id = tr.product_id
       WHERE tr.user_id = $1
       ORDER BY tr.requested_at DESC, tr.trial_id DESC`,
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

// @desc    Get all trial requests (Admin)
// @route   GET /api/admin/trials
// @access  Private/Admin
const getAllTrialRequests = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
         tr.trial_id,
         tr.user_id,
         tr.product_id,
         tr.status,
         tr.requested_at,
         tr.requested_at AS created_at,
         p.product_name,
         u.full_name AS user_name
       FROM trial_requests tr
       LEFT JOIN products p
         ON p.product_id = tr.product_id
       LEFT JOIN users u
         ON u.id = tr.user_id
       ORDER BY tr.requested_at DESC, tr.trial_id DESC`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trial request status (Admin)
// @route   PUT /api/admin/trials/:id/status
// @access  Private/Admin
const updateTrialStatus = async (req, res, next) => {
  try {
    const trialId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = [
      'pending',
      'approved',
      'packed',
      'shipped',
      'delivered',
      'rejected'
    ];

    if (!Number.isInteger(trialId) || trialId < 1) {
      res.status(400);
      throw new Error('Invalid trial request ID');
    }

    if (!allowedStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid trial request status');
    }

    const result = await db.query(
      `UPDATE trial_requests
       SET status = $1
       WHERE trial_id = $2
       RETURNING trial_id, user_id, product_id, status, requested_at`,
      [status, trialId]
    );

    if (result.rows.length === 0) {
      res.status(404);
      throw new Error('Trial request not found');
    }

    res.json({
      success: true,
      message: 'Trial request status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrialRequest,
  getMyTrialRequests,
  getAllTrialRequests,
  updateTrialStatus
};