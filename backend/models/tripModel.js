// /backend/models/tripModel.js

//Load in database
const e = require('express');
let db = require('../../db');

//Load in email service:
let emailServices = require('../../email');

//Load in user model for grabbing emails
const User = require('./userModel').User;

//Setup google maps api for trip calculations
const { Client } = require("@googlemaps/google-maps-services-js");
const dotenv = require("dotenv");
dotenv.config();

// ----------------------- DEFINE TRIP CLASS ------------------------//
class Trip {
    constructor({id, posterID, title, comments, passengers, openSeats, origin, destination, locationDetails, distance, stops, length, payment, date, time, tripStatus, tripType, roundtrip}){
        this.id = id;
        this.posterID = posterID;
        this.title = title;
        this.comments = comments;
        this.passengers = passengers;
        this.openSeats = openSeats;
        this.origin = origin;
        this.destination = destination;
        this.locationDetails = locationDetails;
        this.distance = distance;
        this.stops = stops;
        this.length = length;
        this.payment = payment;
        this.date = date;
        this.time = time;
        this.tripStatus = tripStatus;
        this.tripType = tripType;
        this.roundtrip = roundtrip;

    }

//----------------------------------- DEFINE TRIP CLASS FUNCTIONS ---------------------------//

//Function to create a trip
static async createTrip(tripData, posterID, rideType, car){
    try{
        console.log("tripModel... createTrip... running");
        const tripStatus = "Open"; //Trip status is open by default
        let origin = null; //Declare origin variable
        let roundtrip = null; //Declare roundtrip variable
        let locationDetails = null; //Declare location details variable
        const defaultLocation = { lat: 40.3755, lng: -82.3977 }; //Default location is Kenyon College

        if(rideType === "Requesting a ride"){ //Handle input for ride request fields
            const tripInfo = await Trip.calculateDistanceAndTime(tripData.leavingFromLat, tripData.leavingFromLng, tripData.lat, tripData.lng); //Calculate trip driving time & distance
            if(tripData.requestingRoundtrip === "Yes"){ //Double the distance and trip length if roundtrip
                tripInfo.distance = Trip.doubleDistance(tripInfo.distance);
                tripInfo.duration = Trip.doubleDuration(tripInfo.duration);
                roundtrip = "Yes";
            }else{
                roundtrip = "No";
            }
            if(tripData.leavingFrom === "Other"){ //Pass the address of the leaving destination if it is not campus
                origin = tripData.leavingFromDestination;
                locationDetails = JSON.stringify({"originLat": tripData.leavingFromLat, "originLng": tripData.leavingFromLng, "destinationLat": tripData.lat, "destinationLng": tripData.lng}); //Create JSON with location details for origin & destination
            }
            if(tripData.leavingFrom === "Campus"){
                origin = "Campus"; //Set origin to campus if the trip is from campus
                locationDetails = JSON.stringify({"originLat": tripData.leavingFromLat, "originLng": tripData.leavingFromLng, "destinationLat": tripData.lat, "destinationLng": tripData.lng}); //Create JSON with location details for origin & destination
            }
            //Insert trip into the database
            const sql = 'INSERT INTO tripData (posterID, title, comments, origin, destination, locationDetails, distance, stops, length, payment, date, time, tripStatus, tripType, roundtrip) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
            const params = [posterID, tripData.requestingTitle, tripData.requestingComments, origin, tripData.destination, locationDetails, tripInfo.distance, 1, tripInfo.duration, tripData.requestingPayment, tripData.requestingDate, tripData.requestingTime, tripStatus, rideType, roundtrip];
            const input = await db.query(sql, params) //Input the trip into the database
            if(input.affectedRows === 1){
                return true;
            }else{
                throw new Error("Error inserting trip into database");
            }

        }else{ //Handle input for ride provider fields
            const tripInfo = await Trip.calculateDistanceAndTime(tripData.providingLeavingFromLat, tripData.providingLeavingFromLng, tripData.providingDestinationLat, tripData.providingDestinationLng); //Calculate trip driving time & distance
            if(tripData.requestingRoundtrip === "Yes"){ //Double the distance and trip length if roundtrip
                tripInfo.distance = Trip.doubleDistance(tripInfo.distance);
                tripInfo.duration = Trip.doubleDuration(tripInfo.duration);
                roundtrip = "Yes";
            }else{
                roundtrip = "No";
            }
            if(tripData.providingLeavingFrom === "Other"){ //Pass the address of the leaving destination if it is not campus
                origin = tripData.providingLeavingDestination;
            }
            if(tripData.providingLeavingFrom === "Campus"){ //If the trip is from campus, the ride provider will be providing a meeting point for the ride.
                origin = tripData.meetingPoint;

            }
            //Insert trip into the database
            const locationDetails = JSON.stringify({"originLat": tripData.providingLeavingFromLat, "originLng": tripData.providingLeavingFromLng, "destinationLat": tripData.providingDestinationLat, "destinationLng": tripData.providingDestinationLng}); //Create JSON with location details for origin & destination
            const sql = 'INSERT INTO tripData (posterID, title, comments, openSeats, origin, destination, locationDetails, distance, stops, length, payment, date, time, tripStatus, tripType, roundtrip) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
            const params = [posterID, tripData.providingTitle, tripData.providingComments, car.seatsInCar, origin, tripData.providingDestination, locationDetails, tripInfo.distance, 1, tripInfo.duration, tripData.providingPayment, tripData.providingDate, tripData.providingTime, tripStatus, rideType, roundtrip];
            const input = await db.query(sql, params)

            if(input.affectedRows === 1){
                //Insert trip poster as driver into the database
                const sql2 = 'INSERT INTO tripPassengers (tripID, userID, passengerStatus) VALUES (?,?,?)';
                const params2 = [input.insertId, posterID, "Driver"];
                const input2 = await db.query(sql2, params2);
                return true;
            }else{
                throw new Error("Error inserting trip into database");
            }
        }


    }catch(error){
        console.log("Error in createTrip:", error);
        throw error;
    }
}

//Function to get all trips associated with a user
static async getTripsByUserID(userID){
    console.log("tripModel... getTripsByUserID... running for userID:", userID);
    try{
        const sql = `
        SELECT * FROM tripData
        WHERE posterID = ? AND (tripStatus = "Open" OR tripStatus = "In Progress")
        UNION
        SELECT td.* FROM tripData td
        JOIN tripPassengers tp ON td.id = tp.tripID
        WHERE tp.userID = ? AND (tp.passengerStatus = "Accepted" OR tp.passengerStatus = "Driver") AND (td.tripStatus = "Open" OR td.tripStatus = "In Progress")`;
        const params = [userID, userID];
        const trips = await db.query(sql, params);
        if(trips.length > 0){
            const tripMap = trips.map(trip => new Trip(trip));
            return tripMap
        }else{
            return false;    
        }
    }catch(error){
        console.log("Error in getTripsByUserID:", error);
        throw error;
    }
}

//Function to get a trip by tripID
static async getTripById(tripId) {
    try {
        console.log("tripMode... getTripById... running");
        const sql = 'SELECT * FROM tripData WHERE id = ?';
        const trips = await db.query(sql, [tripId]);
        if (trips.length > 0) {
            return new Trip(trips[0]);
        } else {
            return false;
        }
    } catch (error) {
        console.log("Error in getTripById:", error);
        throw error;
    }
}

//Function to get the email of the user who posted an ID
static async getEmailByPosterID(posterID){
    console.log("tripModel... getEmailByPosterID... running");
    try{
        const sql = 'SELECT email FROM userData WHERE id = ?';
        const params = [posterID];
        const result = await db.query(sql,params);
        if(result.length > 0){
            const posterEmail = result[0].email;
            return posterEmail
        }else{
            return false
        }
    }catch (error){
        console.log("Error in tripModel... getEmailByPosterID")
    }
}

//Function to pull all trips from database (used for trip feed)
static async getAllTrips(){
    console.log("tripModel... getAllTrips... running");
    try {
        const sql = 'SELECT * FROM tripData WHERE tripStatus = "Open" ORDER BY date ASC, time ASC';
        const trips = await db.query(sql);
        if (trips.length > 0) {
            const tripMap = trips.map(trip => {
                const formattedDate = trip.date.toISOString().split('T')[0]; // Make sure date is not being set back a day
                return new Trip({
                    ...trip,
                    date: formattedDate,  // Overwrite the date field with ISO formatted date
                });
            });
            return tripMap;
        } else {
            return false;
        }
    } catch (error) {
        console.log("Error in getAllTrips:", error);
        throw error;
    }
}


//Function to get trip requests for a given userID
static async countTripRequestsByUser(userID) {
    try {
        const sql = `
            SELECT COUNT(*) AS requestCount
            FROM tripPassengers tp
            JOIN tripData td ON tp.tripID = td.id
            WHERE td.posterID = ? AND tp.passengerStatus = 'Requesting'
        `;
        const result = await db.query(sql, [userID]);
        return result[0].requestCount; // Return the count
    } catch (error) {
        console.log("Error in countTripRequestsByUser:", error);
        throw error;
    }
}

//Function to get all passengers requesting to join a trip
static async getPassengersRequestingByTripID(tripID) {
    console.log("tripModel... getPassengersRequestingByTripID... running")
    try {
        const sql = `
            SELECT u.id, u.firstName, u.lastName, u.email
            FROM tripPassengers tp
            JOIN userData u ON tp.userID = u.id
            WHERE tp.tripID = ? AND tp.passengerStatus = 'Requesting'
        `;
        const passengers = await db.query(sql, [tripID]);
        return passengers; // Return the list of passengers
    } catch (error) {
        console.log("Error in getPassengersRequestingByTripID:", error);
        throw error;
    }
}

//Function to get all passengers accepted to a trip
static async getTripPassengers(tripID){
    console.log("tripModel... getTripPassengers running for trip: ", tripID);
    try{
        const sql = `
            SELECT u.id, u.firstName, u.lastName, u.email, tp.passengerStatus
            FROM tripPassengers tp
            JOIN userData u ON tp.userID = u.id
            WHERE tp.tripID = ? AND (tp.passengerStatus = 'Accepted' OR tp.passengerStatus = 'Driver')
            ORDER BY FIELD(tp.passengerStatus, 'Driver', 'Accepted') ASC, u.lastName ASC, u.firstName ASC
            `;
        const passengers = await db.query(sql, [tripID]);
        return passengers; //Return the list of passengers;
    }catch (error){
        console.log("Error in tripModel... getTripPassengers... for trip:", tripID);
        throw error;
    }
}

//Function to check whether a user has already requested to join a trip
static async checkForPassengerRequest(tripID, userID){
    console.log("tripModel... checkForPassengerRequest... running");
    try{
        const sql = "SELECT * FROM tripPassengers WHERE tripID = ? AND userID = ? AND passengerStatus = 'Requesting'";
        const params = [tripID, userID];
        const existingRequest = await db.query(sql, params);
        if (existingRequest.length > 0){
            return {success: true};
        }else{
            return {success: false};
        }
    }catch (error){
        console.log("Error in tripModel... checkForPassengerRequest");
        throw error;
    }
}

//Function for a user to leave a trip
static async leaveTrip(tripID, userID){
    console.log("tripModel... leaveTrip... running");
    let conn;
    try{
        //Get connection & initiate transaction
        conn = await db.pool.getConnection(); //Get a connection from the pool
        await conn.beginTransaction(); //Start a transaction

        //Delete the passenger from the database
        const sql = "DELETE FROM tripPassengers WHERE tripID = ? AND userID = ?";
        const params = [tripID, userID];
        const deletePassenger = await conn.query(sql, params);

        //Update the number of open seats for the trip
        const sql2 = "UPDATE tripData SET openSeats = (openSeats + 1) WHERE id = ?";
        const params2 = [tripID];
        const updateSeats = await conn.query(sql2, params2);

        //Commit the transaction if all queries succeeded
        await conn.commit();

        //Check if the deletion was successful & return user to corresponding page
        if(deletePassenger.affectedRows > 0 && updateSeats.affectedRows > 0){
            //Send an email to the driver that the passenger has left the trip
            const trip = await Trip.getTripById(tripID);
            const driverEmail = await Trip.getEmailByPosterID(trip.posterID);
            await emailServices.sendPassengerLeftEmail(driverEmail, trip.title);
            return {success: true};
        }else{
            return {success: false};
        }
    }catch (error){
        if(conn){
            await conn.rollback(); //Rollback the transaction on error
        }
        throw error;
    }finally{
        if(conn){
            conn.release(); //Release the connection back to the pool
        }
    }
}



//------------------- Trip management functions ---------------------------------//

//Function to accept a trip request from the trip feed
static async acceptTripRequest(tripID, userID, tripPosterID){
    console.log("tripModel... acceptTripRequest... running");
    let conn;
    try{
        //Get a connection from the pool
        conn = await db.pool.getConnection();

        //Start a transaction
        await conn.beginTransaction();

        //Update the trip type to "Providing a ride" in the database. Also set the posterID as the ID of the driver.
        let sql = "UPDATE tripData SET tripType = 'Providing a ride', posterID = ? WHERE id = ?";
        let params = [userID, tripID];
        const updateTrip = await conn.query(sql, params);

        //Add the person who accepted the trip to passengers as the driver
        let sql2 = "INSERT INTO tripPassengers (tripID, userID, passengerStatus) VALUES (?,?,?)";
        let params2 = [tripID, userID, "Driver"];
        const insertDriver = await conn.query(sql2, params2);

        //Add the person who requested the trip to the passenger list for the trip
        let sql3 = "INSERT INTO tripPassengers (tripID, userID, passengerStatus) VALUES (?,?,?)";
        let params3 = [tripID, tripPosterID, "Accepted"];
        const addPassenger = await conn.query(sql3, params3);

        //Update the number of seats open in the trip
        let sql4 = `
        UPDATE tripData td
        JOIN carData cd ON cd.userID = ?
        SET td.openSeats = (cd.seatsInCar - 1)
        WHERE td.id = ?`;
        let params4 = [userID, tripID];
        const updateSeats = await conn.query(sql4, params4);

        //Commit the transaction if all queries succed
        await conn.commit();

        //Send an email to the user who requested the trip that their request has been accepted

        return {success: true};

    }catch(error){
        if (conn) {
            await conn.rollback(); // Rollback the transaction on error
        }
        console.log("Error in tripModel... acceptTripRequest");
        throw error;
    } finally {
        if (conn) {
            conn.release(); // Release the connection back to the pool
        }
    }
}


//Function for a passenger to request to join a trip
static async passengerRequestToJoinTrip(tripID, userID){
    console.log("tripModel... passengerRequestToJoinTrip... running");
    try{
        // Check if the user is already requesting or has joined the trip
        const checkSql = "SELECT * FROM tripPassengers WHERE tripID = ? AND userID = ?";
        const checkParams = [tripID, userID];
        const existingRequest = await db.query(checkSql, checkParams);
        
        if (existingRequest.length > 0) {
            console.log("User is already requesting or has joined this trip.");
            return { success: false};
        }

        //If no existing trip request add the request to the database
        const sql = "INSERT INTO tripPassengers (tripID, userID, passengerStatus) VALUES (?,?,?)"
        const passengerStatus = "Requesting"
        const params = [tripID, userID, passengerStatus];
        const insert = await db.query(sql, params);

        if(insert.affectedRows){
            //Send an email to the poster of the trip that someone has requested to join it
            const trip = await Trip.getTripById(tripID);
            const posterEmail = await Trip.getEmailByPosterID(trip.posterID);
            await emailServices.sendRideRequestEmail(posterEmail, trip.title)
            //Return true if passenger requested successfully
            console.log("User", userID, "successfully requested to join trip: ", tripID);
            return { success: true};
        }else{
            return { success: false};
        }
    }catch (error){
        console.log("Error in tripModel... passengerRequestToJoinTrip");
        throw error;
    }
}

//Function to add a passenger to a trip (updating their status to accepted)
static async acceptPassengerRequest(tripID, userID){
    console.log("tripModel... acceptPassengerRequest... running");
    let conn;
    try{
        //Get # of open seats... don't allow request to be accepted if the car is full
        const trip = await Trip.getTripById(tripID);

        //Establish connection to database;
        conn = await db.pool.getConnection();
        
        //Start a transaction
        await conn.beginTransaction();
        
        if(trip.openSeats > 0){
            //Update passenger status in the database to accepted
            let sql = "UPDATE tripPassengers SET passengerStatus = ? WHERE tripID = ? AND userID = ?"
            const passengerStatus = "Accepted";
            let params = [passengerStatus, tripID, userID];
            const updatePassengers = await conn.query(sql,params)

            //Update the number of open seats for the trip
            sql = "UPDATE tripData SET openSeats = (openSeats - 1) WHERE id = ?";
            params = [tripID];
            const updateSeats = await conn.query(sql,params);

            //Commit the transaction if all queries succeeded
            await conn.commit();

            //Send an email to the user who requested the trip that their request has been accepted
            const user = await User.getUserByID(userID);
            const sendEmail = await emailServices.sendRequestAcceptedEmail(user.email, trip.title);

            //Return success if the passenger was accepted and the seats were updated
            if(updatePassengers.affectedRows > 0 && updateSeats.affectedRows > 0){
                return {success: true, full: false};
            }else{
                return {success: false, full: false};
            }
        }else{
            return {success: false, full: true};
        }
    }catch (error){
        if(conn){
            await conn.rollback(); // Rollback the transaction on error
        }
        console.log("Error in tripModel... acceptPassengerRequest");
        throw error;
    }finally{
        if(conn){
            conn.release(); //Release the connection back to the pool
        }
    }
};

static async denyPassengerRequest(tripID, userID){
    console.log("tripModel... denyPassengerRequest... running");
    try{
        //Delete the passenger request from the database
        const sql = "DELETE FROM tripPassengers WHERE tripID = ? AND userID = ?";
        const params = [tripID, userID];
        const deleteRequest = await db.query(sql, params);

        //Check if the deletion was successful (return success true if it was)
        if(deleteRequest.affectedRows > 0){
            //Send an email to the user who has been denied letting them know what happened
            const user = await User.getUserByID(userID);
            const trip = await Trip.getTripById(tripID);
            await emailServices.sendRequestDeniedEmail(user.email, trip.title);
            return {success: true};
        }else{
            return {success: false};
        }
    }catch (error){
        console.log("Error in tripModel... denyPassengerRequest");
        throw error;
    }
}

static async deletePassengerFromTrip(tripID, userID){
    console.log("tripModel... deletePassengerFromTrip... running");
    let conn;
    try{
        //Get a connection from the pool
        conn = await db.pool.getConnection();

        //Start a transaction
        await conn.beginTransaction();

        //Delete the passenger request from the database
        let sql = "DELETE FROM tripPassengers WHERE tripID = ? AND userID = ?";
        let params = [tripID, userID];
        const deleteRequest = await db.query(sql, params);

        //Update the number of open seats for the trip
        sql = "UPDATE tripData SET openSeats = (openSeats + 1) WHERE id = ?";
        params = [tripID];
        const updateSeats = await db.query(sql,params);

        //Commit the transaction if all queries succeeded
        await conn.commit();

        //Check if the deletion was successful (return success true if it was)
        if(deleteRequest.affectedRows > 0){
            //Send an email to the user who has been denied letting them know what happened
            const user = await User.getUserByID(userID);
            const trip = await Trip.getTripById(tripID);
            await emailServices.sendPassengerDeletedEmail(user.email, trip.title);
            return {success: true};
        }else{
            return {success: false};
        }
    }catch (error){
        if(conn){
            await conn.rollback(); //Rollback the transaction on error
        }
        console.log("Error in tripModel... denyPassengerRequest");
        throw error;
    }finally{
        if(conn){
            conn.release(); //Release the connection back to the pool
        }
    }

}

static async deleteTrip (tripID){
    console.log("tripModel... deleteTrip... running");
    let conn;
    try{
        //Get a connection from the pool
        conn = await db.pool.getConnection();

        //Start a transaction
        await conn.beginTransaction();

        //Get all passengers associated with the trip before deleting them to send emails later
        const passengers = await Trip.getTripPassengers(tripID);

        //Get trip information before it is deleted (also needed for email later)
        const trip = await Trip.getTripById(tripID);

        //Delete the passengers associated with the trip first
        const deletePassengersSql = 'DELETE FROM tripPassengers WHERE tripID = ?';
        const deletePassengersResult = await conn.query(deletePassengersSql, [tripID]);

        //Delete the trip from the database
        const deleteTripSql = 'DELETE FROM tripData WHERE id = ?';
        const deleteTripResult = await conn.query(deleteTripSql, [tripID]);

        //Commit the transaction if both deletions were successful
        await conn.commit();

        if(deleteTripResult.affectedRows > 0 ){
            //Send an email to all users who were passengers on the trip letting them know that it has been deleted
            for(const passenger of passengers){
                await emailServices.sendTripDeletedEmail(passenger.email, trip.title);
            }
            return {success: true}; 
        }else{
            return {success: false}; //If the trip was not deleted, return success false
        }
    }catch (error){
        if(conn){
            await conn.rollback(); //Rollback the transaction on error
        }
        console.log("Error in tripModel... deleteTrip");
        throw error;
    }finally{
        if(conn){
            conn.release(); //Release the connection back to the pool
        }
    }
}



//--------------------------- MISCELLANEOUS FUNCTIONS ---------------------------//
// Function to calculate driving time and distance
static async calculateDistanceAndTime(originLat, originLng, destinationLat, destinationLng){
    console.log("tripModel... calculateDistanceAndTime... running");
    const origin = { lat: originLat, lng: originLng };
    const destination = { lat: destinationLat, lng: destinationLng};
    console.log(origin, destination);
    const client = new Client({});
    
    try {
        const response = await client.distancematrix({
            params: {
                origins: [`${origin.lat},${origin.lng}`],
                destinations: [`${destination.lat},${destination.lng}`],
                mode: "driving",
                units: "imperial", // Returns distance in miles
                key: process.env.GOOGLE_MAPS_API_KEY,
            },
        });

        const data = response.data;
        if (data.rows[0].elements[0].status === "OK") {
            const distance = data.rows[0].elements[0].distance.text; // e.g., "12.4 mi"
            const duration = data.rows[0].elements[0].duration.text; // e.g., "23 mins"
            console.log("Route found successfully")
            return { distance, duration };
        } else {
            throw new Error("No route found.");
        }
    } catch (error) {
        console.error("Error fetching distance and time:", error);
        throw error;
    }
}

//Function to double trip distance & retain syntax for roundtrips
static doubleDistance(distance) {
    const distanceValue = parseFloat(distance.split(' ')[0]);
    const distanceUnit = distance.split(' ')[1];
    const doubledDistance = (distanceValue * 2).toFixed(1);
    return `${doubledDistance} ${distanceUnit}`;
}

//Function to double trip time & retain syntax for roundtrips
static doubleDuration(duration) {
    const durationParts = duration.split(' ');
    let totalMinutes = 0;

    for (let i = 0; i < durationParts.length; i += 2) {
        const value = parseInt(durationParts[i]);
        const unit = durationParts[i + 1];
        if (unit.includes('hour')) {
            totalMinutes += value * 60;
        } else if (unit.includes('min')) {
            totalMinutes += value;
        }
    }

    totalMinutes *= 2;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let doubledDuration = '';
    if (hours > 0) {
        doubledDuration += `${hours} hour${hours > 1 ? 's' : ''} `;
    }
    if (minutes > 0) {
        doubledDuration += `${minutes} min${minutes > 1 ? 's' : ''}`;
    }

    return doubledDuration.trim();
}

//Function to calculate the zoom level for the google maps API call (thank to chatGPT for this one)
static async calculateZoomLevel(lat1, lng1, lat2, lng2, mapWidth, mapHeight) {
    const EARTH_RADIUS = 6378137; // Earth's radius in meters

    // Convert degrees to radians
    const toRadians = (deg) => (deg * Math.PI) / 180;

    // Calculate the distance between the two points
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = EARTH_RADIUS * c;

    // Calculate the zoom level
    const WORLD_DIM = { width: 256, height: 256 }; // Base tile size
    const ZOOM_MAX = 21;

    const latFraction = (lat2 - lat1) / 360;
    const lngFraction = Math.abs(lng2 - lng1) / 360;

    const latZoom = Math.floor(
        Math.log(mapHeight / WORLD_DIM.height / latFraction) / Math.LN2
    );
    const lngZoom = Math.floor(
        Math.log(mapWidth / WORLD_DIM.width / lngFraction) / Math.LN2
    );

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
}


//Bottom of trip class here:
};
exports.Trip = Trip;








//Misceallaneous goole maps api functions:
