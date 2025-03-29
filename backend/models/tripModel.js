// /backend/models/tripModel.js

//Load in database
const e = require('express');
let db = require('../../db');

//Load in email service:
let emailServices = require('../../email');


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
                origin = tripData.leavingFromDestination[0];
                locationDetails = JSON.stringify({"originLat": tripData.leavingFromLat, "originLng": tripData.leavingFromLng, "destinationLat": tripData.lat, "destinationLng": tripData.lng}); //Create JSON with location details for origin & destination
            }
            if(tripData.leavingFrom === "Campus"){
                origin = "Campus"; //Set origin to campus if the trip is from campus
                locationDetails = JSON.stringify({"originLat": tripData.leavingFromLat, "originLng": tripData.leavingFromLng, "destinationLat": tripData.lat, "destinationLng": tripData.lng}); //Create JSON with location details for origin & destination
            }
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
            const locationDetails = JSON.stringify({"originLat": tripData.providingLeavingFromLat, "originLng": tripData.providingLeavingFromLng, "destinationLat": tripData.providingDestinationLat, "destinationLng": tripData.providingDestinationLng}); //Create JSON with location details for origin & destination
            const sql = 'INSERT INTO tripData (posterID, title, comments, openSeats, origin, destination, locationDetails, distance, stops, length, payment, date, time, tripStatus, tripType, roundtrip) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
            const params = [posterID, tripData.providingTitle, tripData.providingComments, car.seatsInCar, origin, tripData.providingDestination, locationDetails, tripInfo.distance, 1, tripInfo.duration, tripData.providingPayment, tripData.providingDate, tripData.providingTime, tripStatus, rideType, roundtrip];
            const input = await db.query(sql, params) //Input the trip into the database
            if(input.affectedRows === 1){
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
        const sql = 'SELECT * FROM tripData WHERE posterID = ?';
        const params = [userID];
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
    try{
        const sql = 'SELECT * FROM tripData WHERE tripStatus = "Open" ORDER BY date ASC, time ASC' ; //Only pull trips that are open, trips in progress aren't joinable.
        const trips = await db.query(sql);
        if(trips.length > 0){
            const tripMap = trips.map(trip => new Trip(trip));
            return tripMap;
        }else{
            return false;
        }
    }catch (error){
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
            SELECT u.id, u.firstName, u.lastName, u.email
            FROM tripPassengers tp
            JOIN userData u ON tp.userID = u.id
            WHERE tp.tripID = ? AND tp.passengerStatus = 'Accepted'
        `;
        const passengers = await db.query(sql, [tripID]);
        return passengers; //Return the list of passengers;
    }catch (error){
        console.log("Error in tripModel... getTripPassengers... for trip:", tripID);
        throw error;
    }
}

//------------------- Trip management functions ---------------------------------//
//Function for a passenger to request to join a trip
static async passengerRequestToJoinTrip(tripID, userID, user){
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
            // const trip = await Trip.getTripById(tripID);
            // const posterEmail = await Trip.getEmailByPosterID(trip.posterID);
            // const acceptUrl = "/Trips/addPassengerToTrip/" + userID;
            // const rejectUrl = "Trips/rejectPassengerRequest/" + userID;
            // if(posterEmail){
            //     const sendEmail = await emailServices.sendRideRequestEmail(posterEmail, trip.title, acceptUrl, rejectUrl)
            // }
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
    try{
        //Get # of open seats... don't allow request to be accepted if the car is full
        trip = Trip.getTripById(tripID);
        
        if(trip.openSeats > 0){
            //Update passenger status in the database to accepted
            let sql = "UPDATE tripPassengers SET passengerStatus = ? WHERE tripID = ? AND userID = ?"
            const passengerStatus = "Accepted";
            let params = [passengerStatus, tripID, userID];
            const updatePassengers = await db.query(sql,params)

            //Update the number of open seats for the trip
            sql = "UPDATE tripData SET openSeats = (openSeats - 1) WHERE id = ?";
            params = [tripID];
            const updateSeats = await db.query(sql,params);

            if(updatePassengers.affectedRows > 0 && updateSeats.affectedRows > 0){
                return {success: true, full: false};
            }else{
                return {success: false, full: false};
            }
        }else{
            return {success: false, full: true};
        }
    }catch (error){
        console.log("Error in tripModel... addPassengerToTrip");
        throw error;
    }
};



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


//Bottom of trip class here:
};
exports.Trip = Trip;








//Misceallaneous goole maps api functions:
