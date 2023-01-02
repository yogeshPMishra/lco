const mongoose = require("mongoose");
const validator = require("validator");


const categoryScheema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "This field is required..."],
        maxLength : [40, "Maximum 40 characters allowed..."]
    },
    photo : {
        id : {
            type : String,
        },
        secure_url : {
            type : String,
            required : [true, "Image field is required..."],
        }
    },
    createdAt : {
        type : Date,
        default : Date.now()
    }
})

module.exports = mongoose.model('Category', categoryScheema)
