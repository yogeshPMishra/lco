const cookieToken = (user, res) =>{
    const options = {
        expires : new Date(
            Date.now() + process.env.COOKIE_TOKEN * 24 *60* 1000
        ),
        httpOnly : true
    };

    const token = user.getJWTToken();
    res.status(200).cookie('token', token, options).json({user : user, token : token, 'message' : 'success'});
}

module.exports = cookieToken;