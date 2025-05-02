//Add in required constants:
const User = require("../models/userModel").User; //Require User model
const Car = require("../models/carModel").Car; //Require car model
const jwt = require("jsonwebtoken");

//----------------------- DEFINE USER CONTROLLER ------------------------//

//Function for a user to add their car to the database
exports.addCar = async (req, res) => {
    console.log("carController.. addCar... running");
    const {make, model, year, color, licensePlate, seatsInCar} = req.body;
    const token = req.cookies.auth_token; // Get token from cookies
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //decode token to get user information
    const userID = decoded.id;
    if (!token) {
        return res.redirect("/?error=notLoggedIn"); //Return user to homepage if no token is found (User should not be able to perform this function)
    }
    try{
        const car = await Car.addCarToDatabase({userID, make, model, year, color, licensePlate, seatsInCar});
        if (car instanceof Car){
            console.log("Car added successfully for user ID:", userID);
            //Update users cookies showing that they have a car:
            const decoded = jwt.verify(token, process.env.JWT_SECRET); //decode token
            const newToken = jwt.sign({ id: decoded.id, firstName: decoded.firstName, lastName: decoded.lastName, email: decoded.email, gender: decoded.gender, verificationStatus: decoded.verificationStatus, has_car: "yes" }, 
                                        process.env.JWT_SECRET,
                                        { expiresIn: "1d" });
                        // Cookie options
            const cookieOptions = {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === "production",
                            maxAge: 24 * 60 * 60 * 1000, // 1 day
                            sameSite: "Strict"
                        };
            res.cookie("auth_token", newToken, cookieOptions); //Update Cookies
            return res.redirect("/User/Profile"); //Redirect user to profile page if car is added successfully (The user route will handle whether they have a car or not)
        }
    }catch(error){
        console.log("Error in addCar Controller:", error);
        return res.redirect("/User/Profile"); //Catch error and return user to profile page (The user route will handle whether they have a car or not)
    }
};

//Function for a user to update their stored car information
exports.updateCar = async (req, res) => {
    console.log("carController.. UpdateCar... running");
    const {make, model, year, color, licensePlate, seatsInCar} = req.body;
    const token = req.cookies.auth_token; // Get token from cookies if it is there
    if(!token){
        return res.redirect("/User/Profile"); //Return user to homepage if no token is found (User should not be able to perform this function)
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET); //decode token to get user information
        const update = await Car.updateCar(decoded.id, {make, model, year, color, licensePlate, seatsInCar});
        if(update){
            console.log("Car updated successfully for user ID:", decoded.id);
            res.cookie("hasCar", "Yes", {httpOnly: true, sameSite: true}); //Update cookies for user showing that they have a car:
            return res.redirect("/User/Profile"); //Redirect user to profile page if car is updated successfully (The user route will handle car information)
        }else{
            console.log("Error updating car for user ID:", decoded.id);
            return res.redirect("/User/Profile"); //Catch error and return user to profile page (The user route will handle car information)
        }
    }catch(error){
        console.log("Error in UpdateCar Controller:", error);
        return res.redirect("/User/Profile"); //Catch error and return user to profile page (The user route will handle whether they have a car or not)
    }
};
