const mongoose = require("mongoose");
const validator = require("validator");


const productScheema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "This field is required..."],
    },
    category : {
        type: mongoose.Schema.ObjectId,
        required : [true, "This field is required..."],
        ref: 'category'
    },
    subcategory : {
        type: mongoose.Schema.ObjectId,
        required : [true, "This field is required..."],
        ref: 'subcategory'
    },
    brand : {
        type: String
    },
    price : {
        type: Number,
    },
    splprice : {
        type: Number,
        required : [true, "This field is required..."],
    },
    quantity : {
        type: String
    },
    status : {
        type: String,
        default : 'active'
    },
    short_description : {
        type: String,
        required : [true, "This field is required..."],
    },
    long_description : {
        type: String,
        required : [true, "This field is required..."],
    },
    attributes : {
        type: String,
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
    photos : [
        {
            id : {
                type : String,
            },
            secure_url : {
                type : String,
                required : [true, "Image field is required..."],
            }
        }
    ],
    createdAt : {
        type : Date,
        default : Date.now()
    }
})

module.exports = mongoose.model('Product', productScheema)
