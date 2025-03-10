// backend/routes/users.js
// ROUTING FOR USERS OF WEBSITE
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//----------------------- ROUTES TO RENDER PAGES ------------------------//


//Route to signup page
router.get("/UserSignupPage", (req, res) => {
    res.render("signup");
});

//Route to render login page
router.get("/UserLoginPage", userController.loginPage);

//Route to render email verification page
router.get("/VerifyEmailPage", userController.verifyEmailPage);

//Route for user to logout
router.get("/LogoutUser", userController.logoutUser);

//Route to render user profile page
router.get("/Profile", userController.profilePage);

//----------------------- ROUTES TO HANDLE USER DATA ------------------------//

//Route to create a user
router.post("/CreateUser", userController.addUser);

//Route for user to validate their email
router.post("/VerifyEmail", userController.verifyEmail);

//Route for user to login
router.post("/LoginUser", userController.loginUser);

//Rout for user to update their profile information
router.post("/UpdateProfile", userController.updateProfile);










//Export router
module.exports = router;


