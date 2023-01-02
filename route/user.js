const express = require("express");
const router = express.Router();

// getting the controller
const { signUp, getUsers, login, forgotPassword, passwordReset, getLoggedInUser, updateUser, deleteUser } = require("../controller/userController");
const { auth } = require("../middleware/auth");

router.route('/signup').post(signUp);
router.route('/login').post(login);
router.route('/forgotPassword').post(forgotPassword);
router.route('/password-reset/:token').post(passwordReset);

router.route('/').get(auth, getUsers);
router.route('/getloggedinuser').get(auth, getLoggedInUser);
router.route('/updateuser/:id').post(auth, updateUser);
router.route('/deleteuser/:id').get(auth, deleteUser);

module.exports = router;