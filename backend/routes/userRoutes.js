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

//----------------------- ROUTES TO HANDLE USER DATA ------------------------//

//Route to create a user
router.post("/CreateUser", userController.addUser);

//Route for user to validate their email
router.post("/VerifyEmail", userController.verifyEmail);

//Route for user to login
router.post("/LoginUser", userController.loginUser);










//Export router
module.exports = router;


