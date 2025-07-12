const { default: mongoose } = require('mongoose');
const RatingAndReview = require('../models/RatingAndReview');
const ratingAndReviews = require('../models/RatingAndReview');
const Course = require('../models/RatingAndReview');

exports.createRating = async (req , res) => {
    try{
        // fetch urseId
        const userId = req.user.id;

        // fetch data from req 
        const {rating, review, courseId} = req.body;

        // check if user is enrolled or not 
        const courseDetails = await Course.findById(courseId);
        if(!courseDetails.studentEnrolled.includes(userId)){
            return res.status(400).json({
                success : false,
                message : "Student not enrolled in the course",
            });
        }
        // check user have rwviewd previously or not 
        const alreadyReviewed = await RatingAndReview.findOne({
            user:userId,
            course: courseId
        })
        if(alreadyReviewed){
            return res.status(403).json({
                success : false,
                message : "Course is already reviewed by user",
            });  
        }

        // create rating and review
        const ratingReview = await RatingAndReview.create({
            rating:rating,
            review:review,
            user:userId,
            course:courseId,
        });


        // push in course
        await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    ratingAndReviews:ratingReview._id
                },
            },
            {new:true},
        )
        console.log(ratingReview);
        return res.status(200).json({
            success:true,
            message:"Rating and Rewview Created succesfully",
            data:ratingReview
        });
    }

    catch(error){
        console.log(error);
            return res.status(500).json({
                success : false,
                message: "Something went wrong while creating Rating and review",
            });  
    }
}



// get average rating
exports.getAverageRating = async (req, res) => {
    
    try{
        // fetch course id 
        const courseId = req.body.courseId;

        // find average rating 
        const result = await RatingAndReview.aggregate(
            [
                {
                    // finding all entries equal to courseID 
                    $match:{
                        course : new mongoose.Schema.Types.ObjectId(courseId),
                    }
                },
                {   
                    // grouping and find avg rating of rating
                    $group:{
                        _id : null,
                        averageRating : {$avg : "$rating"},
                    }
                }

            ]
        );


        // retrun res 
        console.log(result);
        if(result.length  > 0){
            return res.status(200).json({
            success:true,
            message:"Average rating calculated successfully",
            data:result[0].averageRating,
        });
        }

        //  there is no rating 
            return res.status(200).json({
            success:true,
            message:"Average rating is 0",
            data:0,

        }
    
    }
    catch(error){
        console.log(error);
            return res.status(500).json({
                success : false,
                message: "Something went wrong while calculating Rating",
            });  
    }
}


// get ALl rating and reviews
exports.getAllRatingReviews = async (req, res) => {

    try{
        const allRatingReviews = await RatingAndReview.find({})
        .sort({rating: "asc"}) 
        .populate({
            path:"user",
            select : "firstName lastName email image",
        })
        .populate({
            path:"course",
            select:"courseName",
        })
        .exec();



        return res.status(200).json({
            success:true,
            message:"All rating are fetched",
            data:allRatingReviews
        });
    }
    catch(error){
        console.log(error);
            return res.status(500).json({
                success : false,
                message: "Something went wrong while fetching Rating",
            });  
    }

}






