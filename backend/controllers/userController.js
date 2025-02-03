//Add in required constants:
const User = require("../models/userModel").User;
const jwt = require("jsonwebtoken");

//----------------------- DEFINE USER CONTROLLER ------------------------// 

//Control for addUser Function. User is redirected to verification page if user is new, and redirected to homepage if they already exists.
exports.addUser = async (req, res) => {
    console.log("userController.. addUser... running");
    const {firstName, lastName, email, age, gender, password, has_car} = req.body;
    try {
        const user = await User.addUser({ firstName, lastName, email, age, gender, password, has_car});

        if (user instanceof User) {
            // Generate a token (e.g., user ID encrypted)
            const token = jwt.sign(JSON.stringify(user), process.env.JWT_SECRET);

            // Set the cookie
            res.cookie("auth_token", token, {
                httpOnly: true, // Prevents JavaScript access (security best practice)
                secure: process.env.NODE_ENV === "production", // Set to true in production
                maxAge: 1.08e7, // Very long expiration time
                sameSite: "Strict" // Prevents CSRF attacks
            });
            //Log that a user has been added to verify process is working:
            console.log("Cookies added for user with ID:", user.id);
            //Send user to page to verify their email
            return res.redirect("/user/VerifyEmailPage");
        } else {
            return res.redirect("/");
        }
    } catch (error) {
        console.log("Error in addUser Controller:", error);
        return res.redirect("/");
    }
};


