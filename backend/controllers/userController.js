//Add in required constants:
const User = require("../models/userModel").User;
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
            const token = jwt.sign({ id: user.id, email: user.email, verificationStatus: user.verificationStatus}, 
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

        //Render email verification page and pass user information
        res.render("verifyemail", {
            isUser: user instanceof User,
            user: user});

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
            const newToken = jwt.sign({ id: decoded.id, email: decoded.email, verificationStatus: "Yes" }, 
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
        const user = await User.loginUser(email, password); //User object is returned if login is successful.
        if (user instanceof User){
            // Generate a token (e.g., user ID encrypted)
            const token = jwt.sign({ id: user.id, email: user.email, verificationStatus: user.verificationStatus}, 
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

