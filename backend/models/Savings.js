// models/Savings.js
const mongoose = require('mongoose')

const SavingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    targetAmount: {
        type: Number,
        required: true,
        min: 1
    },
    savedAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    emoji: {
        type: String,
        default: '🎯'
    },
    completed: {
        type: Boolean,
        default: false
    },
    iconKey: {
        type: String,
        default: 'target'
    },
    color: {
        type: String,
        default: '#6366f1'
    },
}, { timestamps: true })

module.exports = mongoose.model('Savings', SavingsSchema)