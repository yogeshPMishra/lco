const express = require("express");
const router = express.Router();

// getting the controller
const { getAllSubCategory, addSubCategory, updateSubCategory, deleteSubCategory, getAllSubCategoryByCategory } = require("../controller/subcategory");
const { auth } = require("../middleware/auth");


// Router
router.route('/').get(getAllSubCategory);
router.route('/byCategory/:id').get(getAllSubCategoryByCategory);
router.route('/').post(auth,addSubCategory);
router.route('/update/:id').post(auth,updateSubCategory);
router.route('/delete/:id').get(auth, deleteSubCategory);

module.exports = router;