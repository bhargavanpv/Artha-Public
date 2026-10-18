const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    type : {
        type : String,
        enum : ['debit', 'credit'],
        required : true
    },
    amount : {
        type : Number,
        required : true,
    },
    description : {
        type : String,
        required : false
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    date : {
        type : Date,
        required : true
    },
    category : {
        type : String,
        default :"Uncategorized"
    },
    merchant : {
        type : String,
        required : false
    }
},{
    timestamps : true
});

module.exports = mongoose.model('Transaction',TransactionSchema)