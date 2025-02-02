//Add in required constants:
const User = require("../models/userModel").User;
const jwt = require("jsonwebtoken");

//----------------------- DEFINE USER CONTROLLER ------------------------// 

//Control for addUser Function
exports.addUser = async (req, res) => {
    console.log("userController.. addUser... running");
    const {firstName, lastName, email, age, gender, password, has_car} = req.body;
    console.log(email);
    try{
        await User.addUser({firstName, lastName, email, age, gender, password, has_car});
        return res.redirect("/");
    } catch (error){
        console.log("Error in addUser Controller:", error);
        return res.redirect("/");
    }
};

