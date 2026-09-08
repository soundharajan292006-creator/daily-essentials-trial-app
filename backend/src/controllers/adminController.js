const db = require('../config/db');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND role = $2',
      [email, 'admin']
    );

    const adminUser = result.rows[0];

    if (
      adminUser &&
      (await bcrypt.compare(password, adminUser.password_hash))
    ) {
      res.json({
        success: true,
        message: 'Admin login successful',
        data: {
          id: adminUser.id,
          full_name: adminUser.full_name,
          email: adminUser.email,
          role: adminUser.role,
          token: generateToken(adminUser.id, adminUser.role),
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid admin email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboard = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM products)::int AS total_products,

        (SELECT COUNT(*)
         FROM users
         WHERE role = 'user')::int AS total_users,

        (SELECT COUNT(*) FROM orders)::int AS total_orders,

        (SELECT COUNT(*) FROM trial_requests)::int AS total_trial_requests,

        (SELECT COUNT(*) FROM reviews)::int AS total_reviews,

        (SELECT COUNT(*)
         FROM orders
         WHERE order_status = 'pending')::int AS pending_orders,

        COALESCE(
          (SELECT SUM(total_amount)
           FROM orders
           WHERE payment_status = 'paid'),
          0
        ) AS total_revenue
    `);

    const stats = result.rows[0];

    res.json({
      success: true,
      message: 'Admin dashboard stats fetched successfully',
      data: {
        total_products: stats.total_products,
        total_users: stats.total_users,
        total_orders: stats.total_orders,
        total_trial_requests: stats.total_trial_requests,
        total_reviews: stats.total_reviews,
        pending_orders: stats.pending_orders,
        total_revenue: Number(stats.total_revenue),

        recent_orders: [],
        recent_trial_requests: [],
        low_stock_products: []
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, full_name, email, phone, role, created_at
       FROM users
       WHERE role = $1
       ORDER BY created_at DESC`,
      ['user']
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, full_name, email, phone, role, created_at
       FROM users
       WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length > 0) {
      res.json({
        success: true,
        data: result.rows[0]
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res, next) => {
  try {
    return res.status(501).json({
      success: false,
      message: 'User status management is not configured yet.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginAdmin,
  getAdminDashboard,
  getUsers,
  getUserById,
  updateUserStatus
};