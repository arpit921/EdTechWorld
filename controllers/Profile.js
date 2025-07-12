 const { response } = require('express');
const Profile = require('../models/Profile');
 const User = require('../models/User');

/* we dont need to create a new profile because 
we have created a null profile previously in user section */



// need to explore how can we schedule this deletion process 

// update Profile 
exports.updateProfile = async (req , res) => {
    try{
        //  fetch data 
        const {gender, dateOfBirth="",about="", contactNumber } = req.body;
        // get userId
        const userId = req.user.id;

        //validate data 
        if(!contactNumber || !gender || userId){
            return res.status(401).json({
                success: false,
                message: "Every field required" 
            });       
        }

        // find profile 
        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // update profile
        // new  method 
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();


        // return response 


        return res.status(200).json({
            success: true,
            message: "Profile details are Updated" ,
            data:profileDetails,
        });

         

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Somtihng went wrong while updating a Profile" 
        });
    }
}

// deleteAccount

exports.deleteAccount = async (req, res) => {

    try{
        // fetch id
        const userId = req.user.id;

        // validate
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(401).json({
                success: false,
                message: "Userdetails are wrong" 
            }); 
        }

        // first delete profile 
        await Profile.findByIdAndDelete(userDetails.additionalDetails);

        // unroll user form all enrolled courses then delete user

        // then delete user 
        await User.findByIdAndDelete(id);

        // return response 
            return res.status(200).json({
            success: true,
            message: "AccountDetails Are Deleted" ,
            
        });
        
    }

    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Somtihng went wrong while deleting a account details" 
        });
    }



}


// get all details
exports.getAllUserDetails = async (res , req) => {
    try{
        const userId = req.user.id;

        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(401).json({
                success: false,
                message: "Userdetails are wrong" 
            }); 
        }

        const getAllDetails = await User.findById(userId).populate("additionalDetails").exec();


        // return respisne 
            return res.status(200).json({
            success: true,
            message: "ALl AccountDetails Are Feteched" ,
            
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Somtihng went wrong while deleting a getting details" 
        });
    }
}