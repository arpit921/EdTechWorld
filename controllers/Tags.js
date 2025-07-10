const Tags = require("../models/tags");

// create Tag ka hanlder fucntion 
exports.createTag = async (req ,res) => {
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
        const tagDetails = await Tags.create({
            name,
            description,
        });

        console.log(tagDetails);

        // return response 
        return res.status(200),json({
            success:true,
            message:"Tags are created",

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
exports.showAllTags = async (req, res) => {

    try{
        const allTags = await Tags.find({}, {name:true, description:true});

        return res.status(200),json({
            success:true,
            message:"All tags returned"

        });

    } catch(error){
            return res.status(500),json({
            success:false,
            message:error.message,

        });
    }

}