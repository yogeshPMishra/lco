const Category = require('../model/category');
const Subcategory = require('../model/subcategory');
const Product = require('../model/product');
const cloudinary = require('cloudinary').v2;

exports.getAllCategory = async (req, res, next) =>{
    const category = await Category.find({}).sort({_id : -1});
    if(category.length == 0){
        res.status(200).json({error : "No Categories Available Now..."});return;
    }
    res.status(200).json({ category : category});
}

exports.addCategory = async (req, res, next) =>{
    try{
        if(!req.files.file){
            res.status(200).json({error : "File is Missing..."});return;
        }
    
        // Uploading File
        let result;
        const file = req.files.file;
        const fileExtension = file.name.split(".").pop();
        const fileName = Date.now() + '.' + fileExtension;
        const public_path = __dirname.replace('\controller','');
        let path = public_path + "/public/images/categories/" + fileName;
    
        // Saving the files in the cloudinary
        result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'categories',
            width : 150,
            crop : "scale"
        })
    
        // Saving in the Self Uploading Directory
        // file.mv(path, (err)=>{
        //     if(err){
        //         res.json({error: err});
        //     }
        // })
    
        const { name } = req.body;
        const category = await Category.create({
            name,
            photo : {
                id: result.public_id,
                secure_url: result.secure_url,
            }
        });
    
        if(!category){
            res.status(200).json({error : "Something went wrong while adding category..."});return;
        }
        res.status(200).json({ category : category});
    }catch(error){
        res.status(200).json({error : error.message})
    }
}

exports.updateCategory = async (req, res, next) =>{
    try{
        const id = req.params.id;
        const newData = {
            name : req.body.name,
        }

        const category = await Category.findById(id);
       
        if(!category){
            res.json({error : "Category Id is not valid..."});return;
        }
        
        if(req.files){
            // Deleting the previous image from cloudinary
            cloudinary.uploader.destroy(category.photo.id);
            // Inserting new data to cloudinary
            result = await cloudinary.uploader.upload(req.files.file.tempFilePath, {
                folder: 'categories',
                width : 150, 
                crop : "scale"
            });
    
            newData.photo = {
                id: result.public_id,
                secure_url: result.secure_url,
            }
        }else{
            newData.photo = {
                id: category.photo.id,
                secure_url: category.photo.secure_url,
            }
        }

        const categoryUpdate = await Category.findByIdAndUpdate(id, newData, {
            new : true,
            runValidators : true,
            useFindAndModify : false
        })

        if(!categoryUpdate){
            res.json({error : "Something went wrong while updating Data..."});
        }else{
            res.status(200).json({ category : category}); 
        }
    }catch(error){
         res.json({error : error.message})
    }
}

exports.deleteCategory = async (req, res, next) =>{
    try{
        const id = req.params.id;
        const category = await Category.findById(id);
       
        if(!category){
            res.json({error : "No Category found on this ID..."});
            return;
        }
        cloudinary.uploader.destroy(category.photo.id);
        const deletCategory = await category.remove();
        await Subcategory.deleteMany({category : category._id});
        await Product.deleteMany({category : category._id});
        if(!deletCategory){
            res.json({error : "Something went wrong while deleting the category..."});
            return;
        }
        
        res.json({success : true, message : "Category Deleted..."});
    }catch(err){
        res.json(err.message);
    }
}