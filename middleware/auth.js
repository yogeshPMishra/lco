const User = require('../model/user');
const jwt = require('jsonwebtoken');

exports.auth = async (req, res, next) =>{
    try{
        if(!req.header("Authorization")){
            res.json({error: "Token Not found..."});
            return;
        }
    
        const token = req.header("Authorization").replace("Bearer ", "");
        const verifyToken = await jwt.verify(token, process.env.JWT_SECRET);
    
        if(!verifyToken){
            res.json({error: "Token is not valid..."});
            return;
        }

        req.user = await User.findById(verifyToken.id);
        next();
    }catch(error){
        res.status(200).json({error : error});
    }
}
