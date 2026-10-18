const express = require('express');
const { submitFeedback, getPublicFeedback } = require('../controllers/feedbackController.js');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.post('/', protect, submitFeedback);
router.get('/public', getPublicFeedback);

module.exports = router;