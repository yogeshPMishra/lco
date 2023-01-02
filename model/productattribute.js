const mongoose = require("mongoose");


const productattributeScheema = new mongoose.Schema({
    product_id : {
        type: mongoose.Schema.ObjectId,
        required : [true, "Product ID is required..."],
    },
    attribute_name : {
        type : String,
        required : [true, "This field is required..."],
        maxLength : [40, "Maximum 40 characters allowed..."]
    },
    attribute_value : {
        type : String,
        required : [true, "This field is required..."],
        maxLength : [40, "Maximum 40 characters allowed..."]
    },
    photos : [
        {
            id : {
                type : String,
            },
            secure_url : {
                type : String
            },
            original_image : {
                type : Object
            }
        }
    ],
    createdAt : {
        type : Date,
        default : Date.now()
    }
})

module.exports = mongoose.model('Productattribute', productattributeScheema)
