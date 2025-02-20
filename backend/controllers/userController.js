//Add in required constants:
const User = require("../models/userModel").User; //Require User model
const Car = require("../models/carModel").Car; //Require car model
const jwt = require("jsonwebtoken");

//----------------------- DEFINE USER CONTROLLER ------------------------// 

//Control for addUser Function, User is redirected to verification page if user is new, and redirected to homepage if they already exist.
exports.addUser = async (req, res) => {
    console.log("userController.. addUser... running");
    const {firstName, lastName, email, age, gender, password, has_car} = req.body;
    try {
        const user = await User.addUser({ firstName, lastName, email, age, gender, password, has_car});

        if (user instanceof User) {
            // Generate a token (e.g., user ID encrypted)
            const token = jwt.sign({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, gender: user.gender, verificationStatus: user.verificationStatus}, 
                                     process.env.JWT_SECRET,
                                     { expiresIn: "1d" });
                        // Cookie options
            const cookieOptions = {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === "production",
                            maxAge: 24 * 60 * 60 * 1000, // 1 day
                            sameSite: "Strict"
                        };
            
            // Set the cookie & redirect to email verification page
            res.cookie("auth_token", token, cookieOptions)
            return res.redirect("/User/VerifyEmailPage");
        } else {
            return res.redirect("/");
        }
    } catch (error) {
        console.log("Error in addUser Controller:", error);
        return res.redirect("/");
    }
};

//Control for rendering the email verification page. If user is already verified or has no cookies, they are redirected to the homepage.
exports.verifyEmailPage = async (req, res) => {
    console.log("userController... verifyEmailPage... running");
    const token = req.cookies.auth_token; // Get token from cookies
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //decode token

    if (!token) {
        return res.redirect("/"); // Return to homepage if no token (user has no cookies and should not be here)
    }

    if (decoded.verificationStatus === "Yes"){
        return res.redirect("/"); // Return user to homepage if they are already verified... should not be on verification page
    }

    try{
        //Grab user information from token & grab user data from email
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.getUserByEmail(decoded.email);

        //Send verification code to user:
        const sendEmail = await User.sendVerificationEmail(decoded.email)

        //Grab last page user was on, necessary for dynamic display of verification page.
        const lastPage = req.get('Referer') || '' //Default to '' if can't find last page

        //Render email verification page and pass user information
        res.render("verifyemail", {lastPage: lastPage});

    }catch(error){
        console.log("Error in verifyEmail Controller:", error);
        return res.redirect("/");
    }

};

//Control for verifying user email. If user is verified, their verification status is updated in the database and they are redirected to the homepage.
exports.verifyEmail = async (req, res) => {
    console.log("userController... verifyEmail... running");
    const {inputCode} = req.body //Retrieve input code from email verification form
    try{
        const token = req.cookies.auth_token; //get cookies from user
        const decoded = jwt.verify(token, process.env.JWT_SECRET); //decode token
        const verificationStatus = await User.verifyEmail(decoded.email, inputCode); //Function returns true if user gets verified and vice versa
        if (verificationStatus){
            //Update user verification status in cookie
            const newToken = jwt.sign({ id: decoded.id, firstName: decoded.firstName, lastName: decoded.lastName, gender: decoded.gender, email: decoded.email, verificationStatus: "Yes" }, 
                                        process.env.JWT_SECRET, 
                                        { expiresIn: "1d" });

            //Cookie Options
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 24 * 60 * 60 * 1000, // 1 day
                sameSite: "Strict"
            };

            //Set the cookie & redirect to homepage
            res.cookie("auth_token", newToken, cookieOptions);
            console.log("User:", decoded.email, "has been verified!")
            return res.redirect("/");
        }
    }catch(error){
        console.log("Error in verifyEmail Controller:", error);
        return res.redirect("/");
    }
};

exports.loginPage = async (req, res) => {
    console.log("userController... signupPage... running");
    const token = req.cookies.auth_token; //get cookies from user (if they exist)
    if (token) {
        return res.redirect("/"); // Return to homepage if user has a token (they are already logged in)
    }
    return res.render("login", {loginFailed: false}); //Render login page
};

exports.loginUser = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.logInUser(email, password); //User object is returned if login is successful.
        if (user instanceof User){
            // Generate a token (encrped user ID)
            const token = jwt.sign({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, gender: user.gender, verificationStatus: user.verificationStatus}, 
                process.env.JWT_SECRET,
                { expiresIn: "1d" });
            // Cookie options
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 24 * 60 * 60 * 1000, // 1 day
                sameSite: "Strict"
            };

            // Set the cookie & redirect to homepage
            res.cookie("auth_token", token, cookieOptions)
            return res.redirect("/"); //Return user to homepage after successful login
        }else{
            return res.render("login", {loginFailed: true}); //Return user to login page if login is unsuccessful
        }
    }catch(error){
        console.log("Error in loginUser Controller:", error);
        return res.redirect("/");
    }
};

//Function to log a user out:
exports.logoutUser = async (req, res) => {
    console.log("userController... logoutUser... is running");
    res.clearCookie("auth_token"); //Clear cookies
    return res.redirect("/"); //Redirect user to homepage
};

//Function to render profile page.
exports.profilePage = async (req, res) => {
    console.log("userController... getProfilePage... is running");
    const token = req.cookies.auth_token; //Get cookies from user
    if (!token) {
        return res.redirect("/"); //Return to homepage if user has no cookies, they should not even see the profile page option if they have no cookies.
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); //decode token
        const car = await Car.getCarByUserID(decoded.id); //Get car object by user ID if it exists
        const userPassword = await User.getPasswordByID(decoded.id); //Get user password by user ID
        return res.render("profile", {car: car, 
                                      userHasCar: car instanceof Car,
                                      userPassword: userPassword}); //Render profile page and pass car object and other necessities
    }catch(error){
        console.log("Error in getProfilePage Controller:", error);
        return res.redirect("/"); //Return to homepage if error occurs accessing profile
    }
    
};

//Function to update user profile information
exports.updateProfile = async (req, res) => {
    const token = req.cookies.auth_token; //Get cookies from user
    const {firstName, lastName, password, gender} = req.body; //Get user input from form
    if(!token){ //Return user to homepage if they have no cookies, they should not be performing this function.
        return res.redirect("/");
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET); //Decode token
        console.log("userController... updateProfile... is running for user:", decoded.id);
        const result = await User.updateProfile(decoded.id, {firstName, lastName, password, gender}); //Update user profile information, result is true if successfuly update and false if not
        if(result){
            //Get new user information
            const user = await User.getUserByID(decoded.id);
            //Generate new token
            const newToken = jwt.sign({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, gender: user.gender, verificationStatus: user.verificationStatus}, 
                process.env.JWT_SECRET,
                { expiresIn: "1d" });
            // Cookie options
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 24 * 60 * 60 * 1000, // 1 day
                sameSite: "Strict"
            };
            console.log("User:", user.email, "has been updated! Cookies successfully updated!");
            // Set the cookie & redirect to homepage
            res.cookie("auth_token", newToken, cookieOptions)
            res.redirect("/User/Profile"); //Return to profile page if user information is updated successfully
        }else{
            return res.redirect("/User/Profile"); //Return to profile page if user information is not updated successfully
        }
    }catch(error){
        console.log("Error in updateProfile Controller:", error);
        return res.redirect("/User/Profile"); //Return to profile page if error occurs in updating user information
    }

};

