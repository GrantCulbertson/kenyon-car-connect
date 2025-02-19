// /backend/models/carModel.js

//Load in database
let db = require('../../db');

// ----------------------- DEFINE CAR CLASS ------------------------//
class Car{
    constructor({userID, make, model, year, color, licensePlate, seatsInCar, conversationPreference}){
        this.userID = userID;
        this.make = make;
        this.model = model;
        this.year = year;
        this.color = color;
        this.licensePlate = licensePlate;
        this.seatsInCar = seatsInCar;
        this.conversationPreference = conversationPreference;
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

static async addCarToDatabase(carData){
    try{
        console.log("carModel... addCarToDatabase... running");
        const query = 'INSERT INTO carData (userID, make, model, year, color, licensePlate, seatsInCar, conversationPreference) VALUES (?,?,?,?,?,?,?,?)';
        const params = [carData.userID, carData.make, carData.model, carData.year, carData.color, carData.licensePlate, carData.seatsInCar, carData.conversationPreference];
        const insert = await db.query(query, params); //Insert car into database
        const car = await Car.getCarByUserID(carData.userID); //Grab car from database to verify it was added correctly
        console.log("Car added to database for user:", carData.userID);
        console.log("Car object received:", car);
        return car;
    }catch(error){
        console.log("error in addCarToDatabase");
        throw error;
    }
};

//END OF CLASS DEFINITION
};

//export car model
exports.Car = Car;