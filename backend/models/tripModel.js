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
    constructor({id, posterID, passengers, openSeats, origin, destination, distance, stops, length, payment, date, time, tripStatus, tripType}){
        this.id = id;
        this.poserID = posterID;
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

    }

//----------------------------------- DEFINE TRIP CLASS FUNCTIONS ---------------------------//

//Function to create a trip
static async createTrip(tripData, posterID, rideType){
    try{
        console.log("tripModel... createTrip... running");
        if(rideType === "Requesting a ride"){ //Handle input for ride request fields
            const sql = 'INSERT INTO tripData (posterID, origin, destination, distance, stops, length, payment, date, time, tripStatus, tripType) VALUES (?)';
            const tripStatus = "Open"; //Trip status is open by default
            const tripInfo = await Trip.calculateDistanceAndTime(tripData.leavingFromLat, tripData.leavingFromLng, tripData.lat, tripData.lng); //Calculate trip driving time & distance
            console.log(tripInfo);

        }else{ //Handle input for ride provider fields

        }


    }catch(error){
        console.log("Error in createTrip:", error);
        throw error;
    }
}

// Function to calculate driving time and distance
static async calculateDistanceAndTime(originLat, originLng, destinationLat, destinationLng){
    console.log("tripModel... calculateDistanceAndTime... running");
    const origin = { lat: originLat[0], lng: originLng[0] };
    const destination = { lat: destinationLat[0], lng: destinationLng[0] };
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


//Bottom of trip class here:
};
exports.Trip = Trip;








//Misceallaneous goole maps api functions:
