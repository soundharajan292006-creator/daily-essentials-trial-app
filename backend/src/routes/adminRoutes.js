const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminDashboard, getUsers, getUserById, updateUserStatus } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.post('/login', loginAdmin);
router.get('/dashboard', protect, admin, getAdminDashboard);
router.get('/users', protect, admin, getUsers);
router.get('/users/:id', protect, admin, getUserById);
router.put('/users/:id/status', protect, admin, updateUserStatus);

const { getAllTrialRequests, updateTrialStatus } = require('../controllers/trialController');
router.get('/trials', protect, admin, getAllTrialRequests);
router.put('/trials/:id/status', protect, admin, updateTrialStatus);

const { getAllReviewsAdmin, deleteReviewAdmin } = require('../controllers/reviewController');
router.get('/reviews', protect, admin, getAllReviewsAdmin);
router.delete('/reviews/:id', protect, admin, deleteReviewAdmin);

const { getAllOrdersAdmin, updateOrderStatus } = require('../controllers/orderController');
router.get('/orders', protect, admin, getAllOrdersAdmin);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
