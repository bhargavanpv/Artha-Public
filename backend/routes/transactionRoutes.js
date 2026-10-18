const express = require('express');
const router = express.Router();
 
const { getMonthComparision, getMonthlySummary, getMonthlyComparison , getBankFormats, deleteAllTransactions, addTransaction , getTransaction , uploadStatement, getStats , getUncategorized , updateCategory, deleteTransaction, updateTransaction, getStory } = require("../controllers/transactionController");

const { protect } = require("../middleware/authMiddleware")
const upload = require("../middleware/upload");

//POST APIs
router.post("/add", protect , addTransaction);
router.post("/upload",protect,upload.single('statement'), uploadStatement)

//GET APIs
router.get("/", protect, getTransaction)
router.get("/stats", protect, getStats);
router.get("/uncategorized", protect, getUncategorized);
router.get("/format/:bank", protect, getBankFormats);
router.get("/month-comparison",protect, getMonthComparision)
router.get('/monthly-summary', protect, getMonthlySummary)
router.get('/monthly-comparison', protect, getMonthlyComparison)
router.get('/story', protect, getStory);

//PATCH APIs
router.patch("/:id/category", protect, updateCategory);
router.patch("/:id", protect, updateTransaction);

//DELETE API
router.delete("/delete-all",protect,deleteAllTransactions);
router.delete("/:id", protect, deleteTransaction);

module.exports = router;
