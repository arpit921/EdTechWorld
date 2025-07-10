const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
    {
        courseName:{
            type : String
        },
        courseDescription:{
            type : String
        },
        instructor:{
            type:mongoose.Schema.Types.ObjectId,
            ref : 'User',
            required: true,
        },
        whatWillLearn:{
            type: String,
            trim : true,
        },
        courseContent:{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Section'
        },
        ratingAndReviews:{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'RatingAndReview'
        },
        price:{
            type:Number,
            required:true,
        },
        thumbnail:{
            type:String
        },
        tag:{
            type: mongoose.Schema.Types.ObjectId,
        },
        studentEnrolled:{
            type: mongoose.Schema.Types.ObjectId,
            ref : 'User',
            required : true
        }


        
    }
)
module.exports = mongoose.model('Course', CourseSchema);