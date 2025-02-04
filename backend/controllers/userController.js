//Add in required constants:
const User = require("../models/userModel").User;
const jwt = require("jsonwebtoken");

//----------------------- DEFINE USER CONTROLLER ------------------------// 

//Control for addUser Function. User is redirected to verification page if user is new, and redirected to homepage if they already exist.
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

    if (!token) {
        return res.redirect("/"); // Return to homepage if no token (user has no cookies and should not be here)
    }

    try{
        //Grab user information from token & grab user data from email
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded:", decoded);
        const user = await User.getUserByEmail(decoded.email);

        //Render email verification page and pass user information
        res.render("verifyemail", {user: user});

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
        const token = req.cookies.auth_token; //get get cookies from user
        const decoded = jwt.verify(token, process.env.JWT_SECRET); //decode token
        const verificationStatus = User.verifyEmail(decoded.email, inputCode);

    }catch(error){
        console.log("Error in verifyEmail Controller:", error);
        return res.redirect("/");
    }

};


