const Category = require("../models/Category");
const Course = require("../models/Course");

// create Tag ka hanlder fucntion 
exports.createCategory = async (req ,res) => {
    try{

        // fetch data
        const {name, description} = req.body;

        // validate data
        if(!name || !description){
            return res.status(400),json({
                success:false,
                message:"All fields are required",

            });
        }
        // create entry in DB
        const categoryDetails = await Category.create({
            name,
            description,
        });

        console.log(categoryDetails);

        // return response 
        return res.status(200),json({
            success:true,
            message:"Category are created",

        });
        

    }
    catch(error){
        return res.status(500),json({
            success:false,
            message:error.message,

        });
    }
}


// getAll Tags 
exports.showAllCategory = async (req, res) => {

    try{
        const allTags = await Category.find({}, {name:true, description:true});

        return res.status(200),json({
            success:true,
            message:"All Category returned"

        });

    } catch(error){
            return res.status(500),json({
            success:false,
            message:error.message,

        });
    }

}


// get category page 
exports.getCategoryPage = async (req, res) => {

    try{
        // get category id
        const {categoryId} = req.body;

        // get courses for that category id 
        const selectedCategoryCourses = await Category.findById(categoryId)
        .populate("course")
        .exec();

        // validation 
        if(!selectedCategoryCourses){
            return res.status(404).json({
                success:false,
                message:"There are no courses",
            })

        }


        // just to show more like reccomdation top selling etc 

        // get courses for different catwgoy
        const differentCategoryCourses = await Category.find({
            _id : {$ne : categoryId},
        })
        .populate("course")
        .exec();

        // get top selling courses 

        // return response 
        return res.status(200).json({
            success:true,
            message:"fetched category",
            data:{
                selectedCategoryCourses,
                differentCategoryCourses,
            }
        })


     
    }
    catch(error){

    }
}


