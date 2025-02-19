// /backend/models/carModel.js

//Load in database
let db = require('../../db');

// ----------------------- DEFINE CAR CLASS ------------------------//
class Car{
    constructor({userID, make, model, color, licensePlate, seatsInCar}){
        this.userID = userID;
        this.make = make;
        this.model = model;
        this.color = color;
        this.licensePlate = licensePlate;
        this.seatsInCar = seatsInCar;
    }

//Function to grab a car by user ID:
static async getCarByUserID(userID){
    try{
        console.log("carModel... getCarByUserID... running for userID:", userID);
        const query = 'SELECT * FROM carData WHERE userID = ?';
        const params = [userID];
        const car = await db.query(query, params);
        if (car.length === 0){
            console.log("No car found for user ID:", userID);
            return null; //Return null if no car is found
        }
        return car; //Return car object if car is found attached to user.
    }catch(error){
        console.log("error in getCarByUserID");
        throw error;
    }
};

//END OF CLASS DEFINITION
};

//export car model
exports.Car = Car;