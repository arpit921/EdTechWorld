const Section = require('../models/Section');
const Course = require('../models/Course');

exports.createSection = async (req , res) => {
    try{
        // fetch the data 
        const {sectionName, courseId} = req.body;

        // validate data 
        if(!sectionName || !courseId){
            return res.status(401).json({
                success: false,
                message: "Every field required" 
            });         
        }
        // create section 
        const newSection = await Section.create({sectionName});



        // push in Course 
        const updateCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent : newSection._id,
                },
            },
            {new:true},
        );

        // HW : use populate to replace section/sub-section both in the updateCourseDetails 


        // return response 

        return res.status(200).json({
            success: true,
            message: "Section is Created" ,
            data:updateCourseDetails,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Somtihng went wrong while creating a Section" 
        });
    }
}

exports.updateSection = async (req , res) => {
    try {

        //  fetch data
        const {sectionName , sectionId} = req.body;

        // validate 
        if(!sectionName || !sectionId){
            return res.status(401).json({
                success: false,
                message: "Every field is required to update" 
            });         
        }

        // update data 
        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            {
                $push:{
                    sectionName:sectionName
                }
            },
            {new:true}
        );


        return res.status(200).json({
            success: true,
            message: "Section is Updated" 
            
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Somtihng went wrong while Updating a Section" 
        });
    }
}


exports.deleteSection = async (req, res) =>  {

    try{
        // fetch only id
        // const {sectionId} = req.body;

        // this time we using params , assuming that we are sending section id in Params 

        const {sectionId} = req.params;


        // validate 
        if(!sectionId){
            return res.status(401).json({
                success: false,
                message: "SectionId Not FOund" 
            });  
        }
         
            //  do we need to delete sectionId from Course schema also 


        // Delete
        await Section.findByIdAndDelete(sectionId);

        // return response 
        return res.status(200).json({
            success: true,
            message: "Section is Deleted" 
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Somtihng went wrong while Deleting a Section" 
        });
    }
}

       
