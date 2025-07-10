const { PassThrough } = require("nodemailer/lib/xoauth2");
const User = require("../models/User");
const otpGenerator = require('otp-generator');
const OTP = require("../models/OTP");
const bcrypt = require('bcrypt');
const Profile = require("../models/Profile");
const jwt = require('jsonwebtoken');
const cookie = require('cookie-parser');

// sendOTP
exports.sendOTP = async (req ,res) =>{
    

    try{
    // fetch email from req body
        const {email} = req.body;

        // check whether user already exists or not
        const checkUserPresent = await User.findOne({email});

        // if exist then return response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message : "User Already Exists"
            });

        }

        // else generate otp 
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets : false,
            lowerCaseAlphabets : false,
            specialChars : false,
        });
        console.log("OTP generated : " , otp);

        // check unique otp or not 
        let result = await OTP.findOne({otp});

        // if otp is not unique generate again and again
        while(result){
            otp = otpGenerator.generate(6 , {
                upperCaseAlphabets : false,
                lowerCaseAlphabets : false,
                specialChars : false,
            });
        }

        // create payload for otp 
        const otpPayload = {email , otp};

        // create entry in DB for otp
        const otpBody  = await OTP.create(otpPayload);
        console.log(otpBody);

        // return response 
        return res.status(200).json({
            success:true,
            message : "OTP sent Successfully"
        });

    }
    catch(error){
         console.log("Something wemt wrong while generating OTP ",error);
    }

     
}


// signup
exports.signup = async (req, res) =>{

    try{
        // fetch data from req body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        // validate details 
        if(!firstName || !lastName || !email || !confirmPassword || !password || !otp){
            return res.status(403).json({
                success :  false,
                message: "All fields are required"
            });
        }



        // match both password password and confirm password
        if(confirmPassword != password){
            return res.status(400).json({
                success :  false,
                message: "Password doesnot matching , try again"
            });  
        }

        // check user already exists or not 
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({
                success :  false,
                message: "User already Exists"
            });  
        }

        // find most recent otp stored in DB , because there can be multiple otp 
        const recentOTP = await OTP.find({email}).sort({createdAt : -1}).limit(1);
        console.log(recentOTP);

        // validate otp 
        if(recentOTP.length == 0){
            return res.status(400).json({
                success :  false,
                message: "OTP not found"
            });      
        }
        else{
            if(otp != recentOTP){
                return res.status(400).json({
                success :  false,
                message: "Invalid OTP"
            }); 
            }

        }
        // hash password 
        const hashedPassword = await bcrypt.hash(password, 10);

        // need to create a profile with null values because our DB need it 
        const profileDetails = await Profile.create({
            gender : null,
            dateOfBirth : null,
            about : null,
            contactNumber : null
        });
        // create entry in DB 
        const user = {
            firstName,
            lastName,
            email,
            contactNumber,
            password : hashedPassword,
            accountType,
            additionalDetails : profileDetails,
            image : `https://api.dicebear.com/9.x/initials/svg?seed=${firstName} ${lastName}`,

        }
        // return response 
        return res.status(200).json({
            success:true,
            message:"USer is Registered Successfully",
            user,
        })
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success:false,
            message:"User cannot be registered , pleasr try again"
        });
    }

}



// Login
exports.login = async (req, res) =>{
     
    try{
        // get data from request 
        const {email , password} = req.body;

        // validate data 
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message: "All fields are required"
            });
        }

        // user check exists or not 
        const user = await User.findOne({email});
        if(!userExists){
            return res.status(401).json({
                success:false,
                message: "User not exists"
            });
        }

        // generate JWT, after password matching
        if(await bcrypt.compare(password , user.password)){

            const payload = {
                email : user.email,
                id : user._id,
                accountType : user.accountType,
            };
            const token = jwt.sign(payload , process.env.JWT_SECRET, {
                expiresIn:"2h",
            });

            user.token = token;
            user.password = undefined;

            const options = {
                expires : new Date(Date.now() + 3*24*60*60*1000),
                httpOnly : true,
            }
            // create cookie and send response 
            res.cookie("token" , token , options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in  Succcessfully"
            });
        }
        else{
            return res.status(401).json({
                success:false,
                message: "paassword is incorrect  "
            });       
        }
    }
    catch(error){
        console.log(error);
            return res.status(500).json({
                success:false,
                message: "login failed"
            });     
    }

 

}



// change Password