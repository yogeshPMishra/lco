const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');

// importing all routes here
const home = require("./route/home");
const user = require("./route/user");
const category = require('./route/category');
const subcategory = require('./route/subcategory');
const product = require('./route/product');

// Router Middleware
app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.use(cors({
    origin : "*"
}));

//Cookies and File Middleware
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/"
}));

// Router
app.use('/api/v1', home);
app.use('/api/v1/user', user);
app.use('/api/v1/category', category);
app.use('/api/v1/subcategory', subcategory);
app.use('/api/v1/product', product);

//export app
module.exports = app;