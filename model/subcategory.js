const mongoose = require("mongoose");
const validator = require("validator");


const subcategoryScheema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "This field is required..."],
        maxLength : [40, "Maximum 40 characters allowed..."]
    },
    category : {
        type: mongoose.Schema.ObjectId,
        required : [true, "This field is required..."],
        ref: 'category'
    },
    createdAt : {
        type : Date,
        default : Date.now()
    }
})

module.exports = mongoose.model('Subcategory', subcategoryScheema)
