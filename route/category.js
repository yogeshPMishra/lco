const express = require("express");
const router = express.Router();

// getting the controller
const { getAllCategory, addCategory, updateCategory, deleteCategory } = require("../controller/category");
const { auth } = require("../middleware/auth");

// Router
router.route('/').get(getAllCategory);
router.route('/').post(addCategory);
router.route('/update/:id').post(auth, updateCategory);
router.route('/delete/:id').get(auth, deleteCategory);

module.exports = router;