const app = require("./app");
require("dotenv").config();
const connection = require("./config/db");
connection();
const cloudinary = require('cloudinary').v2
// Clodinary Configuration
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_APP_KEY,
    api_secret : process.env.CLOUDINARY_APP_SECRET,
})

app.listen(process.env.PORT, ()=>{console.log(`Server is running on ${process.env.PORT} port`)});