const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
    category: { 
        type: String, 
        required: true 
    }, // category name string, matches Transaction.category
    limit: { 
        type: Number, 
        required: true 
    },
}, { _id: false });

const BudgetSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    name: { 
        type: String, 
        required: true 
    },
    month: { 
        type: Number, 
        required: true 
    },  // 0-indexed (JS Date month)
    year: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['active', 'completed', 'draft'], 
        default: 'active' 
    },
    incomeExpected: { 
        type: Number, 
        default: 0 
    },
    allocations: [allocationSchema],
    
    rolloverEnabled: {
        type: Boolean, 
        default: false 
    },
    completedAt: { 
        type: Date, 
        default: null 
    },
}, { timestamps: true });

// One active budget per user at a time
BudgetSchema.index({ userId: 1, status: 1 });
// One budget per user per month/year
BudgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);