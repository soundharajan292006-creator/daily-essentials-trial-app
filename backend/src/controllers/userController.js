const db = require('../config/db');
const bcrypt = require('bcryptjs');

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
const getAddresses = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC', [req.user.id]);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add user address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res, next) => {
  try {
    const { full_name, phone, address_line1, address_line2, city, state, pincode, is_default } = req.body;
    
    // If setting as default, update all others to not default
    if (is_default) {
      await db.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
    }

    const result = await db.query(
      `INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.user.id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default || false]
    );

    res.status(201).json({
      success: true,
      message: 'Address added',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user address
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateAddress = async (req, res, next) => {
  try {
    const { full_name, phone, address_line1, address_line2, city, state, pincode, is_default } = req.body;
    
    const checkAddr = await db.query('SELECT * FROM addresses WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if(checkAddr.rows.length === 0) {
        res.status(404);
        throw new Error('Address not found');
    }

    if (is_default) {
      await db.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
    }

    const result = await db.query(
      `UPDATE addresses SET full_name = $1, phone = $2, address_line1 = $3, address_line2 = $4, city = $5, state = $6, pincode = $7, is_default = $8 WHERE id = $9 RETURNING *`,
      [full_name, phone, address_line1, address_line2, city, state, pincode, is_default, req.params.id]
    );

    res.json({
      success: true,
      message: 'Address updated',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    if(result.rows.length === 0) {
        res.status(404);
        throw new Error('Address not found');
    }
    res.json({
      success: true,
      message: 'Address deleted'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, full_name, email, phone FROM users WHERE id = $1', [req.user.id]);
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { full_name, email, phone } = req.body;
    
    // Check email uniqueness if changed
    if (email !== req.user.email) {
      const emailCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if(emailCheck.rows.length > 0) {
          res.status(400);
          throw new Error('Email already in use');
      }
    }

    const result = await db.query(
      'UPDATE users SET full_name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING id, full_name, email, phone',
      [full_name, email, phone, req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    
    const userRes = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = userRes.rows[0];

    if (!(await bcrypt.compare(current_password, user.password_hash))) {
      res.status(400);
      throw new Error('Incorrect current password');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, req.user.id]);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard
// @access  Private
const getUserDashboard = async (req, res, next) => {
  try {
    const trials = await db.query('SELECT COUNT(*) FROM trial_requests WHERE user_id = $1', [req.user.id]);
    const orders = await db.query('SELECT COUNT(*) FROM orders WHERE user_id = $1', [req.user.id]);
    const wishlist = await db.query('SELECT COUNT(*) FROM wishlist WHERE user_id = $1', [req.user.id]);
    const reviews = await db.query('SELECT COUNT(*) FROM reviews WHERE user_id = $1', [req.user.id]);
    
    const recentTrials = await db.query('SELECT * FROM trial_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 3', [req.user.id]);
    const recentOrders = await db.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 3', [req.user.id]);

    res.json({
      success: true,
      data: {
        total_trial_requests: parseInt(trials.rows[0].count),
        total_orders: parseInt(orders.rows[0].count),
        wishlist_count: parseInt(wishlist.rows[0].count),
        reviews_count: parseInt(reviews.rows[0].count),
        recent_trial_requests: recentTrials.rows,
        recent_orders: recentOrders.rows,
      }
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getProfile,
  updateProfile,
  changePassword,
  getUserDashboard
};
