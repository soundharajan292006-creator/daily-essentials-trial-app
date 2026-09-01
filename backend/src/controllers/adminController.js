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

    const result = await db.query('SELECT * FROM users WHERE email = $1 AND role = $2', [email, 'admin']);
    const adminUser = result.rows[0];

    if (adminUser && (await bcrypt.compare(password, adminUser.password_hash))) {
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
    // This is a placeholder for actual complex queries.
    // E.g., count products, users, orders, revenue
    const productsCount = await db.query('SELECT COUNT(*) FROM products');
    const usersCount = await db.query('SELECT COUNT(*) FROM users WHERE role = $1', ['user']);
    const ordersCount = await db.query('SELECT COUNT(*) FROM orders');
    const revenue = await db.query('SELECT SUM(total_amount) FROM orders WHERE payment_status = $1', ['paid']);

    res.json({
      success: true,
      message: 'Admin dashboard stats fetched successfully',
      data: {
        total_products: parseInt(productsCount.rows[0].count),
        total_users: parseInt(usersCount.rows[0].count),
        total_trial_requests: 0, // Mock
        total_orders: parseInt(ordersCount.rows[0].count),
        total_revenue: revenue.rows[0].sum || 0,
        pending_orders: 0, // Mock
        recent_orders: [], // Mock
        recent_trial_requests: [], // Mock
        low_stock_products: [] // Mock
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
        const result = await db.query('SELECT id, full_name, email, phone, role, created_at, status FROM users WHERE role = $1', ['user']);
        res.json({
            success: true,
            data: result.rows
        });
    } catch(error) {
        next(error);
    }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
    try {
        const result = await db.query('SELECT id, full_name, email, phone, role, created_at, status FROM users WHERE id = $1', [req.params.id]);
        if(result.rows.length > 0) {
            res.json({
                success: true,
                data: result.rows[0]
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch(error) {
        next(error);
    }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if(status !== 'active' && status !== 'inactive') {
             res.status(400);
             throw new Error('Invalid status');
        }
        const result = await db.query('UPDATE users SET status = $1 WHERE id = $2 RETURNING id, full_name, status', [status, req.params.id]);
        
        if(result.rows.length > 0) {
            res.json({
                success: true,
                message: 'User status updated',
                data: result.rows[0]
            });
        } else {
             res.status(404);
             throw new Error('User not found');
        }
    } catch(error) {
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
