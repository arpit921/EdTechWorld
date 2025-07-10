const { startSucceeded } = require("init");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");


// resetPassword Token 
exports.resetPasswordToken = async (req, res) => {
    try{
        // get email from req body 
        const email = req.body.email;

        // email exsts or not , emAIL validation
        const user = await User.findOne({email : email});

        if(!user){
            return res.json({
                sucsess : false,
                message : "USer not registered",
            })
        }


        // generate token
        const token = crypto.randomUUID();

        // update user by adding token and expiration time
        const updateDetails = await User.findOneAndUpdate(
        { email : email},
        {
            token : token,
            resetPasswordExpires : Date.now() + 5*60*1000
        },
        {
            new : true
        }
        )

        // create url
        const url = `https://localhost:3000/update-password/${token}`;

        // send mail containing the url,
        await mailSender(email ,
                        "Password reset Link",
                        `Password reset link : ${url}`,
        )
        // return response 
        return res.json({
            sucsess:true,
            message : "Email has been sent to registered email"
        });
        }
        catch(error){
           return res.json({
                sucsess : false,
                message : " Something went wrong while reset password",
            })
        }

} 

// RESET PASSWORD
exports.resetPassword = async (req , res) =>{

    try{
        // fetch data
        const {password , confirmPassword, token} = req.body;
        // validation 
        if(password != confirmPassword){
            return res.json({
                success:false,
                message : "Password not matching",
            });
        }

        // get user details from using token
        const userDetails = await User.findOne({token : token});


        // if no entry - invalid token
        if(userDetails){
            return res.json({
                success:false,
                message : "User Token is invalid ",
            }); 
        }

        // toekn time check expires or not
        if(userDetails.resetPasswordExpires < Date.now() + 5*60*1000){
            return res.json({
                success:false,
                message : "Token is expired , please generate again",
            }); 
        }

        // hash password
        const hashedPassword = await bcrypt(password , 10);

        // password update 
        await User.findOneAndUpdate(
            {token : token},
            {password:hashedPassword},
            {new:true},
        );

        return res.status(200).json({
            success:true,
            message:"Password Updated",
        });
    }
    catch(errr){


            return res.status(500).json({
                success:false,
                message : "Something went wrong",
            }); 
    }


}