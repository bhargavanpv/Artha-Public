const express = require('express');
const router = express.Router();
const {register , login , getMe, deleteAccount, updateProfile, completedTour } = require('../controllers/authController')
const { protect } = require("../middleware/authMiddleware");

router.get('/me', protect, getMe);

router.post('/register', register);
router.post('/login', login);

router.put("/profile", protect, updateProfile)

router.delete('/account', protect, deleteAccount)

router.patch('/tour-complete',protect, completedTour)

module.exports = router;