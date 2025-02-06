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

exports.verifyEmail = async (req, res) => {
    //Code goes here
    console.log("userController... verifyEmail... running");
    const {inputCode} = req.body
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

