const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware").protect;
const Category = require("../models/category");
const Transaction = require("../models/Transaction");

// GET /categories - Get all categories for the authenticated user

router.get("/", protect, async (req, res) => {
    try {
        const filter = { user : req.user.id };
        if (req.query.type) filter.type = req.query.type; // Filter by type if provided
        const categories = await Category.find(filter).sort({ isDefault: -1, name: 1 }); // Sort by isDefault first, then by name
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// POST /categories - Create a new category for the authenticated user
router.post("/", protect, async (req,res) => {
    try {
        const { name, type } = req.body;

        // Validate input
        if( !name || !type ) {
            return res.status (400).json({ message: "Name and type are required" });
        }

        // Check if category already exists for the user
        const exists = await Category.findOne ( {name, type, user: req.user.id, isDefault: false} );
        if(exists){
            return res.status(400).json({ message: "Category already exists" });
        }

        const category = await Category.create({ name, type, user : req.user.id, isDefault: false });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// PATCH /categories/:id - Update a category for the authenticated user
router.patch("/:id", protect, async (req,res) => {
    try {
        const category = await Category.findOne({ _id: req.params.id, user: req.user.id });
        if(!category) {
            return res.status(404).json({ message: "Category not found" });
        }   
        const oldName = category.name;
        const { name } = req.body;
        category.name = name || category.name;
        await category.save();

        // update all transactions with the old category name to the new name
        await Transaction.updateMany(
            { user: req.user.id, category: oldName },
            { category: name}
        );

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// DELETE /categories/:id

router.delete('/:id', protect, async (req, res) => {
    try {
        const category = await Category.findOne({ _id: req.params.id, user: req.user.id });
        if (!category) return res.status(404).json({ message: 'Category not found' });
        if (category.isDefault) return res.status(400).json({ message: 'Cannot delete default category' });
        // orphan transactions to Uncategorized
        await Transaction.updateMany(
            { user: req.user.id, category: category.name },
            { category: 'Uncategorized' }
        );
        await category.deleteOne();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /categories/count?category=X — check before delete warning
router.get('/count', protect, async (req, res) => {
    try {
        const count = await Transaction.countDocuments({
            user: req.user.id,
            category: req.query.category
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;