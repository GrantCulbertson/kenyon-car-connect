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
            const token = jwt.sign({ userId: user.id, email: user.email }, "your_secret_key", { expiresIn: "7d" });

            // Set the cookie
            res.cookie("auth_token", token, {
                httpOnly: true, // Prevents JavaScript access (security best practice)
                secure: process.env.NODE_ENV === "production", // Set to true in production
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
                sameSite: "Strict" // Prevents CSRF attacks
            });
            console.log("Cookies added for user with ID:", user.id);
            return res.redirect("/verifyemail");
        } else {
            return res.redirect("/");
        }
    } catch (error) {
        console.log("Error in addUser Controller:", error);
        return res.redirect("/");
    }
};

exports.verifyEmail = async (req, res) => {

}

