const express = require('express');
const router = express.Router();
const { 
  getAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  getProfile, 
  updateProfile, 
  changePassword, 
  getUserDashboard 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/addresses')
  .get(protect, getAddresses)
  .post(protect, addAddress);

router.route('/addresses/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.put('/change-password', protect, changePassword);

router.get('/dashboard', protect, getUserDashboard);

module.exports = router;
