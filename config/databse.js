const mongoose = require('mongoose');
require('dotenv').config;

exports.connect = () => {
    mongoose.connect('mongodb://localhost:27017/backendServer').then(()=> {
        console.log("MY Database is Connected")
    })
    .catch((err) => {
        console.log(err);
    }
)
}