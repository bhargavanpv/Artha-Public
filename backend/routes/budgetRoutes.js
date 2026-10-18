const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getActiveBudget,
    getAllBudgets,
    getBudgetById,
    createBudget,
    updateBudget,
    upsertAllocation,
    rollBudget,
    deleteBudget,
    getCategoryStatus,
} = require('../controllers/budgetController');

router.get('/active',                 protect, getActiveBudget);
router.get('/active/category-status', protect, getCategoryStatus);
router.get('/all',                    protect, getAllBudgets);
router.get('/:id',                    protect, getBudgetById);
router.post('/',                      protect, createBudget);
router.put('/:id',                    protect, updateBudget);
router.patch('/:id/allocation',       protect, upsertAllocation);
router.post('/:id/roll',              protect, rollBudget);
router.delete('/:id',                 protect, deleteBudget);

module.exports = router;