const Subcategory = require("../model/subcategory");
const Category = require("../model/category");
const Product = require("../model/product");
const cloudinary = require("cloudinary").v2;
const url = require("url");
const Productattribute = require("../model/productattribute");

exports.getAllProduct = async (req, res, next) => {
  const product = await Product.find({})
    .populate({
      path: "category",
      model: Category,
    })
    .populate({
      path: "subcategory",
      model: Subcategory,
    })
    .sort({ _id: -1 });

  if (product.length == 0) {
    res.status(200).json({ error: "No Products Available Now..." });
    return;
  }
  res.status(200).json({ product: product });
};

exports.addProduct = async (req, res, next) => {
  try {
    if (!req.files) {
      res.status(200).json({ error: "File is Missing..." });
      return;
    }
    let imageresult;
    let photos = [];
    if (req.files){
      // Uploading File
      const file = req.files.file;
      const fileExtension = file.name.split(".").pop();
      const fileName = Date.now() + "." + fileExtension;
      const public_path = __dirname.replace("controller", "");
      let path = public_path + "/public/images/products/" + fileName;

      // Saving the files in the cloudinary
      imageresult = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "products",
      });
      
      // Saving in the Self Uploading Directory
      // file.mv(path, (err) => {
      //   if (err) {
      //     res.json({ error: err });
      //   }
      // });

      // Uploading multiple file
      if (req.files.multipleSelectedFile) {

        let multipleimage = [];
        if (req.files.multipleSelectedFile.name != undefined) {
          multipleimage.push(req.files.multipleSelectedFile);
        } else {
          multipleimage = req.files.multipleSelectedFile;
        }

        for (
          let index = 0;
          index < multipleimage.length;
          index++
        ) {
          let result;
          const file = multipleimage[index];
          const fileExtension = file.name.split(".").pop();
          const fileName = Date.now() + "." + fileExtension;
          const public_path = __dirname.replace("controller", "");
          let path = public_path + "/public/images/product_gallery/" + fileName;

          // Saving the files in the cloudinary
          result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "product_gallery",
          });

          // Saving in the Self Uploading Directory
          // file.mv(path, (err) => {
          //   if (err) {
          //     res.json({ error: err });
          //   }
          // });

          let image = {
            id: result.public_id,
            secure_url: result.secure_url,
          };
          photos.push(image);
        }
      }
    }

    const {
      name,
      category,
      subcategory,
      brand,
      price,
      splprice,
      quantity,
      status,
      short_description,
      long_description,
    } = req.body;
    const product = await Product.create({
      name,
      category,
      subcategory,
      brand,
      price,
      splprice,
      quantity,
      status,
      short_description,
      long_description,
      photo: {
        id: imageresult.public_id,
        secure_url: imageresult.secure_url,
      },
      photos: photos,
    });

    if (!product) {
      res
        .status(200)
        .json({ error: "Something went wrong while adding product..." });
      return;
    }
    res.status(200).json({ product: product });
  } catch (error) {
    res.status(200).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const newData = {
      name: req.body.name,
      category: req.body.category,
      subcategory: req.body.subcategory,
      brand: req.body.brand,
      price: req.body.price,
      splprice: req.body.splprice,
      quantity: req.body.quantity,
      status: req.body.status,
      short_description: req.body.short_description,
      long_description: req.body.long_description,
    };

    const product = await Product.findById(id);

    if (!product) {
      res.json({ error: "Product Id is not valid..." });
      return;
    }

    if (req.files) {
      if (req.files.file) {
        // Deleting the previous image from cloudinary
        cloudinary.uploader.destroy(product.photo.id);
        // Inserting new data to cloudinary
        result = await cloudinary.uploader.upload(req.files.file.tempFilePath, {
          folder: "products",
        });

        newData.photo = {
          id: result.public_id,
          secure_url: result.secure_url,
        };
      } else {
        newData.photo = {
          id: product.photo.id,
          secure_url: product.photo.secure_url,
        };
      }

      // Uploading multiple file

      if (req.files.multipleSelectedFile) {
        let multipleimage = [];
        if (req.files.multipleSelectedFile.name != undefined) {
          multipleimage.push(req.files.multipleSelectedFile);
        } else {
          multipleimage = req.files.multipleSelectedFile;
        }

        let photos = [];
        let existingPhotos = product.photos;
        for (let index = 0; index < multipleimage.length; index++) {
          let result;
          const file = multipleimage[index];
          const fileExtension = file.name.split(".").pop();
          const fileName = Date.now() + "." + fileExtension;
          const public_path = __dirname.replace("controller", "");
          let path = public_path + "/public/images/product_gallery/" + fileName;

          // Saving the files in the cloudinary
          result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "product_gallery",
          });

          // Saving in the Self Uploading Directory
          // file.mv(path, (err) => {
          //   if (err) {
          //     res.json({ error: err });
          //   }
          // });

          let image = {
            id: result.public_id,
            secure_url: result.secure_url,
          };
          existingPhotos.push(image);
          newData.photos = existingPhotos;
        }
      }
    }

    const productUpdate = await Product.findByIdAndUpdate(id, newData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    if (!productUpdate) {
      res.json({ error: "Something went wrong while updating Data..." });
    } else {
      res.status(200).json({ product: product });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);

    if (!product) {
      res.json({ error: "No Product Found On This ID..." });
      return;
    }
    cloudinary.uploader.destroy(product.photo.id);
    const deletProduct = await product.remove();

    if (!deletProduct) {
      res.json({
        error: "Something went wrong while deleting the product...",
      });
      return;
    }

    res.json({ success: true, message: "Product Deleted..." });
  } catch (err) {
    res.json(err.message);
  }
};

exports.getSingleProduct = async (req, res, next) => {
  try {
    const product_id = req.params.id;
    const product = await Product.findById(product_id)
      .populate({
        path: "category",
        model: Category,
      })
      .populate({
        path: "subcategory",
        model: Subcategory,
      })
      .sort({ _id: -1 });

    res.status(200).json({
      product: product,
    });
  } catch (error) {
    res.status(200).json({
      error: error.message,
    });
  }
};

exports.getAllProductsByCategory = async (req, res, next) => {
  try {
    var query = require("url").parse(req.url, true).query;
    let data = [];
    const category_id = req.params.id;
    const category = await Category.findById(category_id);
    const subcategories = await Subcategory.find({ category: category_id });
    const minValue = await Product.find({ category: category_id })
      .sort({ splprice: 1 })
      .limit(1);
    const maxValue = await Product.find({ category: category_id })
      .sort({ splprice: -1 })
      .limit(1);

    let clause = {
      category: category_id,
      subcategory: query.subcategory ? query.subcategory : "",
      splprice: query.splprice ? { $lte: query.splprice } : "",
    };
    clause["subcategory"] == "" ? delete clause["subcategory"] : "";
    clause["splprice"] == "" ? delete clause["splprice"] : "";

    var limiting = parseInt(req.query.paginate) || 0;
    var skipping = (parseInt(req.query.page) - 1) * req.query.paginate || 0;

    let totalNumberOfProducts = await Product.find(clause).count();

    let products = await Product.find(clause)
      .populate({
        path: "category",
        model: Category,
      })
      .populate({
        path: "category",
        model: Category,
      })
      .skip(skipping)
      .limit(limiting);

    // Removing all the category except single 0th index
    products.forEach((element, index) => {
      if (index != 0) products[index].category = undefined;
    });

    res
      .status(200)
      .json({
        products: products,
        category: category,
        subcategories: subcategories,
        minValue: minValue,
        maxValue: maxValue,
        totalNumberOfProducts: totalNumberOfProducts,
      });
  } catch (err) {
    res.json({ error: err });
  }
};

exports.getRecomendedItems = async (req, res, next) => {
  try {
    const products = await Product.find({}).limit(12).sort({ _id: -1 });
    res.status(200).json({ products: products });
  } catch (error) {
    res.json({ error: error.message });
  }
};

exports.removeMultipleImage = async (req, res, next) => {
  try {
    var query = require("url").parse(req.url, true).query;
    const id = query.product_id;
    let image_id = req.params.id.toString();
    const public_id = image_id.replace("<", "/");
    const product = await Product.findById(id);

    if (!product) {
      res.json({ error: "No Product Found On This ID..." });
      return;
    }

    for (let index = 0; index < product.photos.length; index++) {
      if (public_id == product.photos[index].id) {
        // Deleting the previous image from cloudinary
        cloudinary.uploader.destroy(public_id);

        // Saving the product after deleting the image
        product.photos.splice(index, 1);
        await product.save({ validateBeforeSave: false });
      }
    }
    res.json({ success: true, message: "Image Deleted..." });
  } catch (error) {
    res.json({ error: error.message });
  }
}

exports.updateAttribute = async (req, res, next) =>{
    try{
      const product_id = req.params.id;
      // const existingProductAttributes = await Productattribute.find({ product_id : product_id });
      const productAttributes = req.body;
      let photos = [];
  
      if(productAttributes._id){
        let existingattr = await Productattribute.findById(productAttributes._id);
        if(existingattr.photos != ''){
          // photos = existingattr.photos;
          existingattr.photos.forEach((element, index) => {
            if(req.body.images != ""){
              let imgbody = []; // Here we are assigning all the images to an array because a string can be placed...
              if(typeof(req.body.images) == 'string'){
                imgbody.push(req.body.images);
              }else{
                imgbody = req.body.images;
              }
              imgbody.forEach((ele, ind) => {
                if(ele == element.id){
                  photos.push(element);
                }
              });
            }
          });
        }
        await Productattribute.deleteOne({_id : productAttributes._id});
      }
            
      if (req.files) {
        let multipleimage = [];
        if (req.files.images.name != undefined) {
          multipleimage.push(req.files.images);
        } else {
          multipleimage = req.files.images;
        }
        for (
          let index = 0;
          index < multipleimage.length;
          index++
        ) {
          const file = multipleimage[index];
          const fileExtension = file.name.split(".").pop();
          const fileName = Date.now() + "." + fileExtension;
          const public_path = __dirname.replace("controller", "");
          let path = public_path + "/public/images/productattributes/" + fileName;
  
          imageresult = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "productattributes",
          });
  
          let image = {
            id: imageresult.public_id,
            secure_url: imageresult.secure_url,
            original_image: file,
          };
          photos.push(image);
        }
      }
  
      const addAttribute = await Productattribute.create({
        attribute_name:  req.body.attribute,
        attribute_value : req.body.attribute_value,
        product_id : product_id,
        photos : photos
      });
  
      if(!addAttribute){
        res.json({ error : 'issue while adding your data...'});
      }
  
      res.json({
         message:  'Attributes are updated...',
         data : addAttribute
      });
    }catch(err){
      console.log(err);
      res.json({error : err});
    }
}

exports.getAttributesByProduct = async (req, res, next) =>{
  try{
    const product_id = req.params.id;
    const attributes = await Productattribute.find({product_id});
    if(!attributes){
      res.json({ error : 'issue while getting your data...'});
    }

    res.json({
       message:  'Success...',
       data : attributes
    });

  }catch(err){
    console.log(err);
  }
}

exports.removeAttributeValue = async (req, res, next) =>{
  try{
    const id = req.params.id;
    
    // Removing the images

    const attributeValue = await Productattribute.findById(id);
    if(!attributeValue){
      res.json({
        error : 'No Items found on this ID...'
      });
    }

    if(attributeValue.photos != ""){
      attributeValue.photos.forEach((ele, ind) => {
        cloudinary.uploader.destroy(ele.id);
      });
    }

    const deleteAttribtueValue = await Productattribute.deleteOne({_id : id});
    if(!deleteAttribtueValue){
      res.json({
        error : 'Something went wrong while removing the item...'
      });
    }

    res.json({
      message : 'Attribute Value removed...'
    });

  }catch(error){
    res.json({error : error});
  }
}

exports.removeAttribute = async (req, res, next) =>{
  try{
    var query = require("url").parse(req.url, true).query;
    if(!query.attribute){
      res.json({
        error : 'Attribute Name is not given...'
      });return;
    }
    var attribute_name = query.attribute;

    const product_id = req.params.id;
    // Removing the images

    const attributes = await Productattribute.find({product_id : product_id});
    
    attributes.forEach((element, index) => {
      if(attribute_name == element.attribute_name){
        if(element.photos != ""){
          element.photos.forEach((ele, ind) => {
            cloudinary.uploader.destroy(ele.id);
          });
        }
      }
    });

    
    const deleteAttribtue = await Productattribute.deleteMany({attribute_name : attribute_name});
    if(!deleteAttribtue){
      res.json({
        error : 'Something went wrong while removing the item...'
      });
    }

    res.json({
      message : 'Attribute removed...'
    });

  }catch(error){
    res.json({error : error});
  }
}
