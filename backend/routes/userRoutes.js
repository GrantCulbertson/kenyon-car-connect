// backend/routes/users.js
// ROUTING FOR USERS OF WEBSITE
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//----------------------- DEFINE USER ROUTES ------------------------//


//Route to create a user
router.post("/CreateUser", userController.addUser);




//Export router
module.exports = router;


