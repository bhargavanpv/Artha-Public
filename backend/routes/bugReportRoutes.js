const express = require('express');
const { protect } = require('../middleware/authMiddleware.js');
const { submitBugReport } = require('../controllers/bugReportController.js');

const router = express.Router();

router.post('/', protect, submitBugReport);

module.exports = router;