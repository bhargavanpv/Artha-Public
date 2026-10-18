// controllers/savingsController.js
const Savings = require('../models/Savings')

// GET all savings for user
const getSavings = async (req, res) => {
    try {
        const savings = await Savings.find({ userId: req.user.id }).sort({ createdAt: -1 })
        res.status(200).json(savings)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST create a new saving
const createSaving = async (req, res) => {
    const {
        name,
        targetAmount,
        savedAmount,
        iconKey,
        color
    } = req.body

    console.log('SAVING BODY:', req.body)

    if (!name?.trim()) {
        return res.status(400).json({ message: 'Name is required' })
    }

    if (!targetAmount || targetAmount <= 0) {
        return res.status(400).json({
            message: 'Target amount must be greater than 0'
        })
    }

    try {
        const saving = await Savings.create({
            userId: req.user.id,
            name: name.trim(),
            targetAmount: Number(targetAmount),
            savedAmount: Number(savedAmount) || 0,
            iconKey: iconKey || 'target',
            color: color || '#6366f1'
        })

        console.log('SAVED:', saving)

        res.status(201).json(saving)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// PATCH update saving
const updateSaving = async (req, res) => {
    const {
        savedAmount,
        name,
        targetAmount,
        iconKey,
        color
    } = req.body

    try {
        const saving = await Savings.findOne({
            _id: req.params.id,
            userId: req.user.id
        })

        if (!saving) {
            return res.status(404).json({
                message: 'Saving not found'
            })
        }

        if (name !== undefined) {
            saving.name = name.trim()
        }

        if (targetAmount !== undefined) {
            saving.targetAmount = Number(targetAmount)
        }

        if (savedAmount !== undefined) {
            saving.savedAmount = Number(savedAmount)
        }

        if (iconKey !== undefined) {
            saving.iconKey = iconKey
        }

        if (color !== undefined) {
            saving.color = color
        }

        saving.completed = saving.savedAmount >= saving.targetAmount

        await saving.save()

        console.log('UPDATED:', saving)

        res.status(200).json(saving)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// DELETE a saving
const deleteSaving = async (req, res) => {
    try {
        const saving = await Savings.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        })

        if (!saving) {
            return res.status(404).json({
                message: 'Saving not found'
            })
        }

        res.status(200).json({ message: 'Deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = {
    getSavings,
    createSaving,
    updateSaving,
    deleteSaving
}