const User = require("../model/user");
const cookieToken = require("../util/cookieToken");
const mailHelper = require("../util/emailHelper");
const cloudinary = require('cloudinary').v2;
const crypto = require("crypto");

exports.getUsers = async (req, res, next) =>{
    // console.log(req.user);
    const user = await User.find({email: { $ne: req.user.email }}).sort({_id:-1}) ;

    if(!user){
        res.status(404).json({error : "No Users Available Now..."});
    }
    res.status(200).json({ user : user});
}

exports.getLoggedInUser = async (req, res, next) =>{
    res.json({user : req.user});
}

exports.signUp = async (req, res, next) =>{
   try{
        if(!req.files){
            res.status(200).json({error : "File is Missing..."});return;
        }
        // Uploading File
        let result;
        const file = req.files.file;
        const fileExtension = file.name.split(".").pop();
        const fileName = Date.now() + '.' + fileExtension;
        const public_path = __dirname.replace('\controller','');
        let path = public_path + "/public/images/users/" + fileName;
    
        // Saving the files in the cloudinary
        result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'users',
            width : 150,
            crop : "scale"
        })

        // Saving in the Self Uploading Directory
        // file.mv(path, (err)=>{
        //     if(err){
        //         res.json({error: err});
        //     }
        // })
        
        const { name, email, password, role } = req.body;

        if(!email){
            res.status(200).json({error : "Email Is Required...."});
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            photo : {
                id : result.public_id,
                secure_url : result.secure_url
            }
        });
        user.password = undefined;

        if(!user){
            res.status(200).json({error : "Something went wrong...."});
        }

        cookieToken(user, res);
   }catch(error){
        res.json({error : error.message})
   }
}

exports.updateUser = async (req, res, next) =>{
    try{
        const id = req.params.id;
        const newData = {
            name : req.body.name,
            email : req.body.email,
            role : req.body.role,
        }

        const user = await User.findById(id);
       
        if(!user){
            res.json({error : "User Id is not valid..."});return;
        }
        
        if(req.files){
            // Deleting the previous image from cloudinary
            cloudinary.uploader.destroy(user.photo.id);
            // Inserting new data to cloudinary
            result = await cloudinary.uploader.upload(req.files.file.tempFilePath, {
                folder: 'users',
                width : 150, 
                crop : "scale"
            });
    
            newData.photo = {
                id: result.public_id,
                secure_url: result.secure_url,
            }
        }else{
            newData.photo = {
                id: user.photo.id,
                secure_url: user.photo.secure_url,
            }
        }

        const userUpdate = await User.findByIdAndUpdate(id, newData, {
            new : true,
            runValidators : true,
            useFindAndModify : false
        })

        if(!userUpdate){
            res.json({error : "Something went wrong while updating Data..."});
        }else{
            cookieToken(user, res);
        }
    }catch(error){
         res.json({error : error.message})
    }
 }

 exports.deleteUser = async (req, res, next) =>{
    try{
        const id = req.params.id;
        const user = await User.findById(id);
       
        if(!user){
            res.json({error : "No user found on this ID..."});
            return;
        }
        cloudinary.uploader.destroy(user.photo.id);
        const deletUser = await user.remove();
    
        if(!deletUser){
            res.json({error : "Something went wrong while deleting the user..."});
            return;
        }
    
        res.json({success : true, message : "User Deleted..."});
    }catch(err){
        res.json(err.message);
    }
}

exports.login = async (req, res, next) =>{
    try{
        const {email, password, role} = req.body;
        const user = await User.findOne({email, role}).select("+password");
        if(!user){
            res.status(200).json({ error : "You are not a registered user..." });return;
        }

        const validatePassword = await user.validatePassword(password);
        if(!validatePassword){
            res.status(200).json({ error : "User Id OR Password not Matched..." });return;
        }

        cookieToken(user, res);
    }catch(error){
        res.json({ error : error.message});
    }
}

exports.forgotPassword = async (req, res, next) =>{
    try{
        const { email } = req.body;
        const user = await User.findOne({email}); 

        if(!user){
            res.status(200).json({
                error : "You are not a registered user..."
            });return;
        }

        const token = await user.getForgotPasswordToken();
        await user.save({validateBeforeSave : false});

        const url = req.body.link + token;
        // const url = `${req.protocol}://${req.get("host")}/api/v1/user/password-reset/${token}`;

        const message = `Copy paste this link to reset your password \n\n ${url}`;

        await mailHelper({
            toEmail : user.email,
            subject : 'New Ecommerce Forgot password...',
            text_message : message
        });
        
        res.status(200).json({user : user, 'message' : 'We have sent a link to your email for reseting password...'});
        
    }catch(error){
        this.forgot_password_token = undefined;
        this.forgot_password_expiry = undefined;
        await user.save({validateBeforeSave : false});
        res.status(200).json({
            error : error.message
        });
    }
}

exports.passwordReset = async (req, res, next) =>{
    try{
        const token = req.params.token;

        const encrypted_token = crypto.createHash('sha256').update(token).digest('hex');
       
        const user = await User.findOne({forgot_password_token :encrypted_token, forgot_password_expiry : {
            $gt : Date.now()
        }});
        
        if(!user){
            res.status(200).json({
                error : "Token Not matched..."
            });return;
        }
        
        if(req.body.password !== req.body.reset_password){
            res.status(200).json({
                error : "Password and Confirm Password doesnot matched..."
            });return;
        }

        user.password = req.body.password;

        user.forgot_password_expiry = undefined;
        user.forgot_password_token = undefined;

        await user.save();
        
        cookieToken(user, res);
    }catch(error){
        res.status(200).json({
            error : error.message
        });return;
    }
}

