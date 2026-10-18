const mongoose = require("mongoose")

const feedbackSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required : true
    },
    name : {
        type : String,
        required : true
    },
    email :{
        type : String,
        required : true
    },
    designation : {
        type : String,
        default : ""
    },
    mainFeedback : {
        type : String,
        required : true
    },
    detailedExperience : {
        type : String,
        default : ""
    },
    consentToDisplay : {
        type : Boolean,
        default : false
    },
    anonymous : {
        type : Boolean,
        default : false
    },
    memberSince : {
        type : Date,
        required : true
    }
}, { timestamps : true });

module.exports = mongoose.model("Feedback", feedbackSchema);