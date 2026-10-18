const express = require('express')
const router = express.Router()
const { getSavings, createSaving, updateSaving, deleteSaving } = require('../controllers/savingsController')
const { protect } = require('../middleware/authMiddleware')

router.get('/', protect, getSavings)

router.post('/', protect, createSaving)

router.patch('/:id', protect, updateSaving)

router.delete('/:id', protect, deleteSaving)

module.exports = router