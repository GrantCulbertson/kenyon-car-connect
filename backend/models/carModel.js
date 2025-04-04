// /backend/models/carModel.js

//Load in database
const e = require('express');
let db = require('../../db');

// ----------------------- DEFINE CAR CLASS ------------------------//
class Car{
    constructor({userID, make, model, year, color, licensePlate, seatsInCar}){
        this.userID = userID;
        this.make = make;
        this.model = model;
        this.year = year;
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
        const rows = await db.query(query, params);
        if (rows.length === 0){ //If nothing is returned they don't have a car.
            console.log("No car found for user ID:", userID);
            return null; //Return null if no car is found
        }
        console.log("Car found for user ID:", userID);
        return new Car(rows[0]); //Return car object if car is found attached to user.
    }catch(error){
        console.log("error in getCarByUserID");
        throw error;
    }
};

static async addCarToDatabase(carData){
    try{
        console.log("carModel... addCarToDatabase... running");
        const carQuery = 'INSERT INTO carData (userID, make, model, year, color, licensePlate, seatsInCar) VALUES (?,?,?,?,?,?,?)';
        const carParams = [carData.userID, carData.make, carData.model, carData.year, carData.color, carData.licensePlate, carData.seatsInCar];
        const insert = await db.query(carQuery, carParams); //Insert car into database
        const car = await Car.getCarByUserID(carData.userID); //Grab car from database to verify it was added correctly
        console.log("Car added to database for user:", carData.userID);
        console.log("Car object received:", car);
        let userQuery = "UPDATE userData SET has_car = 'yes' WHERE id = ?";
        let userParams = [carData.userID];
        const updateProfile = await db.query(userQuery, userParams);
        return car;
    }catch(error){
        console.log("error in addCarToDatabase");
        throw error;
    }
};

static async updateCar(userID, carData){
    try{
        console.log("carModel... updateCar... running for userID:", userID);
        const query = 'UPDATE carData SET make = ?, model = ?, year = ?, color = ?, licensePlate = ?, seatsInCar = ? WHERE userID = ?';
        const params = [carData.make, carData.model, carData.year, carData.color, carData.licensePlate, carData.seatsInCar, userID];
        const update = db.query(query, params); //Update car info in database
        if(update.affectedRows > 0){
            return true; //Return true if update is successful
        }else{
            return false; //Return false if update is unsuccessful
        }
    }catch(error){
        console.log("error in updateCar", error);
        throw error;
    }
}

//END OF CLASS DEFINITION
};

//export car model
exports.Car = Car;