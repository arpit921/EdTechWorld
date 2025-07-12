const {instance} = require('../config/razorpay');
const Course = require('../models/Course');
const User = require('../models/User');
const mailSender = require("../utils/mailSender");
const {courseEnrolled} = require('../mail/templates/courseEnrolled');
const { mongo, model } = require('mongoose');



// capture the payment and intiate the razorpay order

exports.capturePayment = async (req , res) => {
    try{
        // get courseId and userId from request body
        const {courseId} = req.body;
        const userId = req.user.id;

        // validation 
        if(!courseId){
            return res.status(400).json({
                success : false,
                message: "Course ID is required",
            });
        }

        const courseDetails = await Course.findById(courseId);
        if(!courseDetails){
            return res.status(400).json({
                success : false,
                message: "Course not found",
            });
        }

        // is user already enrolled in course or not 
        const uid = new mongooose.Types.ObjectId(userId);
        if(courseDetails.studentEnrolled.includes(uid)){
            return res.status(400).json({
                success : false,
                message: "You are already enrolled in this course",
            });
        }

        const amount = courseDetails.price*100; // converting to paise
        const currency = "INR";

        // crreate razoerpay order
        const options = {
            amount: amount,
            currency : currency,
            receipt: `receipt_${Date.now()}`,
            notes: {
                courseId: courseDetails._id,
                userId: userId,
            }
        }

        try{
            
            const paymentResponse = await instance.orders.create(options);
            console.log("Payment Response : ", paymentResponse);
        }
        catch(error){
            console.log("Error while creating razorpay order : ", error);
            return res.status(500).json({
                success : false,
                message: "Something went wrong while creating payment order",
            });
        }

        return res.status(200).json({
            success : true,
            message: "Payment order created successfully",
            data: paymentResponse,
            courseName: courseDetails.courseName,
            courseDescription: courseDetails.description,
            coursePrice: courseDetails.price,
            orderId : paymentResponse.id,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message: "Something went wrong while capturing payment",
        });
    }
    

}


// verify signature and enroll user in course 

exports.verifySignature = async (req , res) => {
 

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if(digest == signature){
        console.log("Signature verified successfully");

        /*that time we cant get userId and courseId from request body 
        because this is a webhook call not a normal API call from client or from frontend
*/
       /* so this time we will get userId and courseId from the payload of the request body
        which we have sent in response while creating the order
*/

        const {courseId, userId} = req.body.payload.payment.entity.notes;
        try{
            // now we will enroll the user in the course

            // push course id of course in user model 
            const userDetails = await User.findByIdAndUpdate(
                userId,
                {
                    $push:{
                        courses : courseId,
                    }
                },
                {new:true}
            );


            // we can also do 
            // courseDetails.courses = courseId;
            // await courseDetails.save();
            if(!userDetails){
                return res.status(400).json({
                    success : false,
                    message: "User not found",
                });
            }

            console.log("User details after enrolling in course : ", userDetails);
            
            
      

            // push user id in Course model
            
            const courseDetails = await Course.findByIdAndUpdate(
                courseId,
                {
                    $push:{
                        studentEnrolled: userId,
                    }
                },
                {new:true}
            );

            if(!courseDetails){
                return res.status(400).json({
                    success : false,
                    message: "Course not found",
                });
            }
            console.log("Course details after enrolling user in course : ", courseDetails);

            // send email to user about course enrollment
            const emailResponse = await mailSender({
                email: userDetails.email,
                subject: "Course Enrollment Successful",
                html: courseEnrolled(courseDetails.courseName, userDetails.firstName),
            });

            console.log("Email response : ", emailResponse);

        }
        catch(error){
            console.log("Error while enrolling user in course : ", error);
            return res.status(500).json({
                success : false,
                message: "Something went wrong while enrolling user in course",
            });
        }
    }
    else {
        console.log("Signature verification failed");
        return res.status(400).json({
            success : false,
            message: "Signature verification failed",
        });

     
    }
}

