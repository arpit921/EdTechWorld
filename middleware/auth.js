const jwt = require('jsonwebtoken');
require('dotenv').config;




// auth 
exports.auth = async (req , res , next) =>{

    try{
    // extract token 
        const token = req.cookies.token 
                        || req.body.token 
                        || req.header("Authorisation").replace("Bearer ", "" );

        // if token missing, then return response 
        if(!token){
            return res.status(401).json({
                success : false,
                message : "Token is missing",
            });
        }

        // verify token 
        try{
            const decode = await jwt.verify(token , process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch(err){
            return res.status(401).json({
                success:false,
                message:"token is invalid",
            })
        }

        next();
        
    }
    catch(error){
                return res.status(401).json({
                success:false,
                message:"Something went wrong while validating token",
            })
    }


    }


// isStudent
exports.Student = async (req, req, next) => {

    try{
        if(req.user.accountType !== "Student"){
              return res.status(401).json({
                success : false,
                message : "this is protected route for Students only",
              });
        }
        next();
    }
    catch(error){
              return res.status(500).json({
                success : false,
                message : "User orle cananot be verified , please try again",
              });
    }
}

// isInstructor

exports.isInstructor = async (req, req, next) => {

    try{
        if(req.user.accountType !== "Instructor"){
              return res.status(401).json({
                success : false,
                message : "this is protected route for Instructor only",
              });
        }
        next();
    }
    catch(error){
              return res.status(500).json({
                success : false,
                message : "User orle cananot be verified , please try again",
              });
    }
}

// isAdmin
exports.isAdmin = async (req, req, next) => {

    try{
        if(req.user.accountType !== "Admin"){
              return res.status(401).json({
                success : false,
                message : "this is protected route for Admin only",
              });
        }
        next();
    }
    catch(error){
              return res.status(500).json({
                success : false,
                message : "User orle cananot be verified , please try again",
              });
    }
}