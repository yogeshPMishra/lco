const express = require("express");
const router = express.Router();

// getting the controller
const { 
    getAllProduct, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    getSingleProduct, 
    getAllProductsByCategory, 
    getRecomendedItems, 
    removeMultipleImage, 
    updateAttribute, 
    getAttributesByProduct,
    removeAttributeValue,
    removeAttribute
} = require("../controller/productController");

const { auth } = require("../middleware/auth");

//Without Middleware
router.route('/').get(getAllProduct);
router.route('/recomendedItems').get(getRecomendedItems);
router.route('/byCategory/:id').get(getAllProductsByCategory);
router.route('/:id').get(getSingleProduct);

// With Auth Middleware
router.route('/').post(auth, addProduct);
router.route('/update/:id').post(auth, updateProduct);
router.route('/delete/:id').get(auth, deleteProduct);
router.route('/remove-multiple-image/:id').get(auth, removeMultipleImage);
router.route('/update-attribute/:id').post(auth, updateAttribute);
router.route('/get-attribute/:id').get(auth, getAttributesByProduct);
router.route('/remove-attribute-value/:id').get(auth, removeAttributeValue);
router.route('/remove-attribute/:id').get(auth, removeAttribute);

module.exports = router;