//Add in required constants:
const User = require("../models/userModel").User; //Require User model
const Car = require("../models/carModel").Car; //Require car model
const jwt = require("jsonwebtoken");

//----------------------- DEFINE USER CONTROLLER ------------------------//
exports.addCar = async (req, res) => {
    console.log("carController.. addCar... running");
    const {make, model, year, color, licensePlate, seatsInCar, conversationPreference} = req.body;
    const token = req.cookies.auth_token; // Get token from cookies
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //decode token to get user information
    const userID = decoded.id;
    if (!token) {
        return res.redirect("/"); //Return user to homepage if no token is found (User should not be able to perform this function)
    }
    try{
        const car = await Car.addCarToDatabase({userID, make, model, year, color, licensePlate, seatsInCar, conversationPreference});
        if (car instanceof Car){
            console.log("Car added successfully for user ID:", userID);
            return res.redirect("/User/Profile"); //Redirect user to profile page if car is added successfully (The user route will handle whether they have a car or not)
        }
    }catch(error){
        console.log("Error in addCar Controller:", error);
        return res.redirect("/User/Profile"); //Catch error and return user to profile page (The user route will handle whether they have a car or not)
    }
};