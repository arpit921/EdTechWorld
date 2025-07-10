const Course = require("../models/Course");
const Tag = require("../models/tags");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

// create course handler fuction 
exports.createCourse = async (req , res) => {

    try{
        // fetch data 
        const {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price, 
            tag
        }                   =  req.body;

        // fetch file 
        const thumbnail = req.files.thumbnailImage;

        // validation 
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag){
            return res.status(400).json({
                success : false,
                message: "ALl fields are required",
            });
        }
    
        // check for instructor 

        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details : ", instructorDetails);

        if(!instructorDetails){
            return res.status(400).json({
                success : false,
                message: "Instructor Details are not found",
            });
        }

        // cehck tag valid or not
        const tagDetails = await Tag.findById(tag);
        if(!tag){
            return res.status(400).json({
                success : false,
                message: "Tag not found",
            });
        }


        // upload image to clodinary 
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);


        // create an entry for new course in DB

        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatWillLearn,
            price,
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url,

        });


        // add the new course in the user shcema for instructor 
        await User.findByIdAndUpdate(
            {id : instructorDetails._id},
            {
                $push:{
                    courses : newCourse._id,
                }
            },
            {new:true},
        );

        // update tag schema 
        await Tag.findByIdAndUpdate(
            {id : tag},
            {
                $push:{
                    courses : newCourse._id,
                }
            },
            {new:true},
        );

            return res.status(200).json({
                success : true,
                message: "Course is created",
                data:newCourse
            });

    }   catch(error){
        console.log(error);
            return res.status(500).json({
                success : false,
                message: "Something went wrong while creating course",
            });

    }



}




// getAllCourseb 
exportsgetAllCourses = async (req, res) => {
    try{
        const allCourses = await Course.find({}, {
            courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentEnrolled:true,
        }).populate("instructor")
        .exec();

            return res.status(200).json({
                success : true,
                message: "All courses are fetched",
                data:allCourses,
            });



    }   catch(error){
        console.log(error);
            return res.status(500).json({
                success : false,
                message: "Sometthing went wrong while getting all courses",
            });
    }
}