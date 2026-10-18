const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    plan : {
        type : String,
        enum : ["free", "plus", "pro", "power"],
        default : 'free'
    },
    // --- NEW FOR SUBSCRIPTION MODEL---
    subscriptionId: {
        type: String,
        default: null
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'cancelled', 'halted', 'pending', null],
        default: null
    },
    currentPeriodEnd: {
        type: Date,
        default: null
    },
    // --- END NEW ---
    planExpiresAt: {
        type: Date,
        default: null
    },
    dailyMessageCount:{
        type:Number,
        default: 0
    },
    lastMessageDate:{
        type: Date,
        default : null
    },
    balanceMode: {
        type: String,
        enum: ['auto', 'manual'],
        default: 'auto'
    },
    manualBalance: {
        type: Number,
        default: null
    },
    tourCompleted : {
        type : Boolean,
        default : false
    },
    balanceSetDate : {
        type : Date,
        default : null
    },
    hasSetBalance: {
        type : Boolean,
        default : false
    }
},{
    timestamps : true
}
);

module.exports = mongoose.model('User', UserSchema)