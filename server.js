const express = require('express');
const dbConnect = require('./config/databse')
const app = express();


dbConnect;
app.listen(3000 , () => {
    console.log("Server Started");
})
