//Add in required constants:
//const Trip = require("../models/tripModel").Trip; //Require Trip model
const e = require("express");
const jwt = require("jsonwebtoken");
const Trip = require("../models/tripModel").Trip; //Require User model
const Car = require("../models/carModel").Car; //Require car model
require('dotenv').config();


//----------------------- DEFINE TRIP CONTROLLER ------------------------// 

//Function to render the trip posting page
exports.postTripPage = (req, res) => {
    console.log("tripController... postTripPage... running");
    const token = req.cookies.auth_token; // Get token from cookies
    if(!token){
        return res.redirect("/"); //Return to homepage if they have no cookies, although they should not be able to click the button to this page if they don't have cookies anyways.
    }else{
        res.render("postingtrip", {GoogleMapsAPIKey: process.env.GOOGLE_MAPS_API_KEY}); //Render the page to post a trip and pass the google maps api key
    }
};

//Function to create a trip from the posting page
exports.createTrip = async (req, res) => {
    console.log("tripController... createTrip... running");
    const token = req.cookies.auth_token; // Get token from cookies
    if(!token){
        return res.redirect("/"); //Send user back to homepage if they don't have cookies, although they shouldn't be able to do this anyways if they don't have cookies
    }else{ //If they have cookies proceed with adding the trip to the database
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET); //Decode the token
            const posterID = decoded.id; //Get the user id from the decoded token
            const rideType = req.body.rideType; //Get input from the trip posting form
            if(rideType === "Requesting a ride"){ // If the user is requesting or providing a ride the information needed will be different
                const {leavingFrom, leavingFromDestination, leavingFromLat, leavingFromLng, destination, lat, lng, requestingPayment, requestingTime, requestingDate, requestingTitle, requestingComments, requestingRoundtrip} = req.body; //Get input from the trip posting form
                const result = await Trip.createTrip({leavingFrom, leavingFromDestination, leavingFromLat, leavingFromLng, destination, lat, lng, requestingPayment, requestingTime, requestingDate, requestingTitle, requestingComments, requestingRoundtrip}, 
                                                    posterID, rideType, null); //Create the trip
                if(result){
                    res.redirect("/"); //If the trip is successfully added to the database, redirect to the homepage
                }
            }else{ //If the user is providing a ride...
                const car = await Car.getCarByUserID(posterID); //Get the car information for the user
                const {providingLeavingFrom, meetingPoint, providingLeavingDestination, providingLeavingFromLat, providingLeavingFromLng, providingDestination, providingDestinationLat, providingDestinationLng, providingRoundtrip, providingPayment, providingTime, providingDate, providingTitle, providingComments} = req.body; //Get input from the providing portion of the trip posting form
                const result = await Trip.createTrip({providingLeavingFrom, meetingPoint, providingLeavingDestination, providingLeavingFromLat, providingLeavingFromLng, providingDestination, providingDestinationLat, providingDestinationLng, providingRoundtrip, providingPayment, providingTime, providingDate, providingTitle, providingComments},
                                                    posterID, rideType, car); //Create the trip
                if(result){
                    res.redirect("/"); //If the trip is successfully added to the database, redirect to the homepage
                }
            }
        }catch(err){
            console.log(err);
            res.redirect("/Trips/postTrip"); //If error, redirect to post trip page
        }
    }
};













