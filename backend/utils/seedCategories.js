const Category = require('../models/category');

const DEFAULT_EXPENSE = [
    "Food & Dining",
    "Transportation",
    "Travel",
    "Shopping",
    "Groceries",
    "Utilities",
    "Bills",
    "Health / Medicines",
    "Education",
    "Entertainment",
    "Subscriptions",
    "Personal Care",
    "Uncategorized",   
];

const DEFAULT_INCOME = [
    "Salary",
    "Business",
    "Investments",
    "Interest",
    "Rental Income",
    "Freelancing",
    "Friend's Philanthropy",
    "Family Support",
    "Uncategorized",
];

const seedCategories = async (userId) => {
    const expense = DEFAULT_EXPENSE.map(name => ({
        name, type: "expense", user: userId, isDefault: true
    }));
    const income = DEFAULT_INCOME.map(name => ({
        name, type: "income", user: userId, isDefault: true
    }));

    const all = [...expense, ...income];

    for (const cat of all) {
        await Category.updateOne(
            { name: cat.name, user: cat.user },
            { $setOnInsert: cat },
            { upsert: true }
        );
    }
};
module.exports = seedCategories;