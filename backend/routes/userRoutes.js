// backend/routes/users.js
// ROUTING FOR USERS OF WEBSITE
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//----------------------- ROUTES TO RENDER PAGES ------------------------//


//Route to signup page
router.get("/UserSignup", (req, res) => {
    res.render("signup");
});

//Route to render email verification page
router.get("/VerifyEmailPage", (req, res) => {
    res.render("verifyemail");
});

//----------------------- ROUTES TO HANDLE USER DATA ------------------------//

//Route to create a user
router.post("/CreateUser", userController.addUser);

//Route for user to validate their email
//router.post("/VerifyEmail", userController.verifyEmail);








//Export router
module.exports = router;


