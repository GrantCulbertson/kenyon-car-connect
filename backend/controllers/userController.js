//Add in required constants:
const User = require("../models/userModel").User;
const jwt = require("jsonwebtoken");

//----------------------- DEFINE USER CONTROLLER ------------------------// 

//Control for addUser Function
exports.addUser = async (req, res) => {
    console.log("userController.. addUser... running");
    const {first_name, last_name, email, age, gender, password, has_car} = req.body;
    try{
        
    }
};

