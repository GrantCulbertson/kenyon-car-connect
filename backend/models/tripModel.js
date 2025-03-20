// /backend/models/tripModel.js

//Load in database
const e = require('express');
let db = require('../../db');

//Setup google maps api for trip calculations
const { Client } = require("@googlemaps/google-maps-services-js");
const dotenv = require("dotenv");
dotenv.config();

// ----------------------- DEFINE TRIP CLASS ------------------------//
class Trip {
    constructor({id, posterID, title, comments, passengers, openSeats, origin, destination, distance, stops, length, payment, date, time, tripStatus, tripType, roundtrip}){
        this.id = id;
        this.posterID = posterID;
        this.title = title;
        this.comments = comments;
        this.passengers = passengers;
        this.openSeats = openSeats;
        this.origin = origin;
        this.destination = destination;
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
            }
            if(tripData.leavingFrom === "Campus"){
                origin = "Campus"; //Set origin to campus if the trip is from campus
            }
            const sql = 'INSERT INTO tripData (posterID, title, comments, origin, destination, distance, stops, length, payment, date, time, tripStatus, tripType, roundtrip) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
            const params = [posterID, tripData.requestingTitle, tripData.requestingComments, origin, tripData.destination, tripInfo.distance, 1, tripInfo.duration, tripData.requestingPayment, tripData.requestingDate, tripData.requestingTime, tripStatus, rideType, roundtrip];
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
            const sql = 'INSERT INTO tripData (posterID, title, comments, openSeats, origin, destination, distance, stops, length, payment, date, time, tripStatus, tripType, roundtrip) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
            const params = [posterID, tripData.providingTitle, tripData.providingComments, car.seatsInCar, origin, tripData.providingDestination, tripInfo.distance, 1, tripInfo.duration, tripData.providingPayment, tripData.providingDate, tripData.providingTime, tripStatus, rideType, roundtrip];
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
            console.log(tripMap);
            return tripMap
        }else{
            return false;    
        }
    }catch(error){
        console.log("Error in getTripsByUserID:", error);
        throw error;
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

//Bottom of trip class here:
};
exports.Trip = Trip;








//Misceallaneous goole maps api functions:
