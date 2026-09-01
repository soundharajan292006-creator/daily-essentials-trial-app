const db = require('../config/db');

// @desc    Create a trial request
// @route   POST /api/trials
// @access  Private
const createTrialRequest = async (req, res, next) => {
  try {
    const { product_id, quantity, trial_price, delivery_address_id } = req.body;
    
    if (quantity < 1) {
      res.status(400);
      throw new Error('Invalid quantity');
    }

    const checkProduct = await db.query('SELECT * FROM products WHERE id = $1', [product_id]);
    if(checkProduct.rows.length === 0) {
        res.status(404);
        throw new Error('Product not found');
    }
    
    if(checkProduct.rows[0].trial_stock < quantity) {
         res.status(400);
         throw new Error('Not enough trial stock');
    }

    const result = await db.query(
      `INSERT INTO trial_requests (user_id, product_id, quantity, trial_price, delivery_address_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, product_id, quantity, trial_price, delivery_address_id, 'pending']
    );

    res.status(201).json({
      success: true,
      message: 'Trial request created',
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
    const result = await db.query('SELECT * FROM trial_requests WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
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
    const result = await db.query('SELECT * FROM trial_requests ORDER BY created_at DESC');
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
    const { status } = req.body;
    const allowedStatuses = ['pending', 'approved', 'packed', 'shipped', 'delivered', 'rejected'];
    
    if(!allowedStatuses.includes(status)) {
        res.status(400);
        throw new Error('Invalid status');
    }

    const result = await db.query(
      `UPDATE trial_requests SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );

    if(result.rows.length === 0) {
        res.status(404);
        throw new Error('Trial request not found');
    }

    res.json({
      success: true,
      message: 'Trial request status updated',
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
  updateTrialStatus,
};
