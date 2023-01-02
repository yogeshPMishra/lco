const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userScheema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "This field is required..."],
        maxLength : [40, "Maximum 40 characters allowed..."]
    }, 
    email : {
        type : String,
        required : [true, "This field is required"],
        validate : [validator.isEmail, "Please enter email in correct format..."],
        unique  : [true, "This email is already exist..."]
    },
    password : {
        type : String,
        required : [true, "This field is required..."],
        maxLength : [40, "Maximum 40 characters allowed..."],
        select : false
    },
    role: {
        type : String,
        default : "user"
    },
    photo : {
        id : {
            type : String,
        },
        secure_url : {
            type : String,
        }
    },
    forgot_password_token : {
        type : String
    },
    forgot_password_expiry : {
        type : Date
    },
    createdAt : {
        type : Date,
        default : Date.now()
    }
})

// Encrypting password before save
userScheema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})

// validate the password with database password
userScheema.methods.validatePassword = async function(usersGivenPassword){
    return await bcrypt.compare(usersGivenPassword, this.password);
}

// JWT token creation
userScheema.methods.getJWTToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRY
    });
}

// Create Forgot password token
userScheema.methods.getForgotPasswordToken = function(){
    const token = crypto.randomBytes(20).toString('hex');
    
    // Here we are getting a hash of the random token and storing in database
    this.forgot_password_token = crypto.createHash('sha256').update(token).digest('hex');

    // Time update
    this.forgot_password_expiry = Date.now() + 20 *60 *1000;
    
    // returning the token
    return token;
}
module.exports = mongoose.model('User', userScheema)