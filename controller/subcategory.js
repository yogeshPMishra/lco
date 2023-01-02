const Subcategory = require('../model/subcategory');
const Category = require('../model/category');

exports.getAllSubCategory = async (req, res, next) =>{
    const subcategory = await Subcategory.find({}).populate({
        path: 'category',
        model: Category
   }).sort({_id : -1});

    if(subcategory.length == 0){
        res.status(200).json({error : "No Sub Categories Available Now..."});return;
    }
    res.status(200).json({ subcategory : subcategory});
}

exports.getAllSubCategoryByCategory = async (req, res, next) =>{
    let data = [];
    const category_id = req.params.id;

    let subcategory = await Subcategory.find({category :category_id}).populate({
        path: 'category',
        model: Category
    });

    subcategory.forEach((element, index)=>{
        if (index != 0) 
        subcategory[index].category = undefined;
    });

    res.status(200).json({ subcategory : subcategory});
}

exports.addSubCategory = async (req, res, next) =>{
    try{
        const { name, category } = req.body;
        const subcategory = await Subcategory.create({
            name,
            category
        });
    
        if(!subcategory){
            res.status(200).json({error : "Something went wrong while adding subcategory..."});return;
        }
        res.status(200).json({ subcategory : subcategory});
    }catch(error){
        res.status(200).json({error : error.message})
    }
}

exports.updateSubCategory = async (req, res, next) =>{
    try{
        const id = req.params.id;
        const newData = {
            name : req.body.name,
            category : req.body.category,
        }

        const subcategory = await Subcategory.findById(id);
       
        if(!subcategory){
            res.json({error : "Subcategory Id is not valid..."});return;
        }

        const subcategoryUpdate = await Subcategory.findByIdAndUpdate(id, newData, {
            new : true,
            runValidators : true,
            useFindAndModify : false
        })

        if(!subcategoryUpdate){
            res.json({error : "Something went wrong while updating Data..."});
        }else{
            res.status(200).json({ subcategory : subcategory}); 
        }
    }catch(error){
         res.json({error : error.message})
    }
}

exports.deleteSubCategory = async (req, res, next) =>{
    try{
        const id = req.params.id;
        const subcategory = await Subcategory.findById(id);
       
        if(!subcategory){
            res.json({error : "No Sub Category Found On This ID..."});
            return;
        }
        const deletSubCategory = await subcategory.remove();
    
        if(!deletSubCategory){
            res.json({error : "Something went wrong while deleting the subcategory..."});
            return;
        }
    
        res.json({success : true, message : "Sub Category Deleted..."});
    }catch(err){
        res.json(err.message);
    }
}