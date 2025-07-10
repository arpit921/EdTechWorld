const express = require('express');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        firstName:{
            type:String,
            required:true,
            maxLength:50,
        },
        lastName:{
            type:String,
            required:true,
            maxLength:50,
        },
        email:{
            type:String,
            required:true,
            maxLength:50,
        },
        contactNo:{
            type:String,
            required:true,
            maxLength:50,
        },
        password:{
            type:String,
            required:true,
            maxLength:50,
        },
        accountType : {
            type : String,
            enum : ['Admin', 'Student', 'Instructor'],
            ref : 'Profile'
        },
        token : {
            type : String
        },
        resetPasswordExpires :{
            type : Date,
        },
        additionalDetails:{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Profile',
        },
        courses:[{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Courses'
        }],
        image:{
            type : String,
            required : true,
        },
        courseProgress:[
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'CourseProgress'
            }
        ]
        
    }
)

module.exports = mongoose.model('User' , UserSchema);

    


