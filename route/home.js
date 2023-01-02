const express = require("express");
const router = express.Router();

// getting the controller
const { home } = require("../controller/homeController");

router.route('/').get(home);

module.exports = router;