const express = require('express');
const router = express.Router();
const { createTrialRequest, getMyTrialRequests } = require('../controllers/trialController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createTrialRequest);

router.get('/my', protect, getMyTrialRequests);

module.exports = router;
