const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    type : {
        type : String,
        enum : ['expense', 'income'],
        required : true
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    icon: { 
        type: String,
         default: 'tag' 
    }
}, {timestamps : true});


CategorySchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema); 