//Add in required constants:
//const Trip = require("../models/tripModel").Trip; //Require Trip model
const e = require("express");
const jwt = require("jsonwebtoken");
const Trip = require("../models/tripModel").Trip; //Require User model
const Car = require("../models/carModel").Car; //Require car model
require('dotenv').config();


//----------------------- DEFINE TRIP CONTROLLER ------------------------// 

//---------------------- FUNCTIONS THAT RENDER PAGES -------------------//

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

//Function to render the trip info page
exports.viewTripPage = async (req,res) => {
    console.log("tripController... viewTripPage... running");
    const tripId = req.params.id; //Grab trip ID from page URL
    const token = req.cookies.auth_token;
    if(!token){
        return res.redirect("/"); //Return to homepage if they have no cookies, they should not be able to access this page
    }else{
        try{
            const trip = await Trip.getTripById(tripId);
            if(trip){
                return res.render("trip", {trip, GoogleMapsAPIKey: process.env.GOOGLE_MAPS_API_KEY});
            }else{
                res.status(404).send('Oops... trip not found');
            }
        }catch (err){
            console.log(err);
            res.redirect("/"); //Return to homepage if there is an error
        }
    }
}

//Function to render the your trips page
exports.yourTripsPage = async (req, res) => {
    console.log("tripController... yourTripsPage... running");
    const token = req.cookies.auth_token; // Get token from cookies
    if(!token){
        return res.redirect("/"); //Send user back to homepage if they don't have cookies associated with them, they should not be able to access this page.
    }else{
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET); //Decode the token
            const userID = decoded.id; //Get the user id from the decoded token
            const trips = await Trip.getTripsByUserID(userID); //Get all trips associated with the user
            if(trips){
                //Iterate through trips and add passengers requesting to join
                for(const trip of trips){
                    if(trip.posterID === userID && trip.tripType === "Providing a ride"){
                        trip.passengersRequesting = await Trip.getPassengersRequestingByTripID(trip.id);
                    }else{
                        trip.passengersRequesting = [];
                    }
                }
                res.render("yourtrips", {trips}); //Render the your trips page and pass the trips associated with the user
            }else{
                res.render("yourtrips", {trips: []}); //Render the page with no trips if nothing is found for the user
            }
        }catch(err){
            console.log("Error in tripController... yourTripsPage...", err);
            res.redirect('/?error=serverError') //If error, redirect to homepage
        }
    }
};

//---------------------- FUNCTIONS THAT HANDLE DATA -------------------//

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
                                                    posterID, rideType); //Create the trip
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

//Function for a passenger to request to join a trip
exports.passengerRequestToJoinTrip = async (req,res) => {
    console.log("tripController... passengerRequestToJoinTrip... running");
    const token = req.cookies.auth_token;
    const tripID = req.params.id; //Grab trip ID from page URL
    if(!token){
        res.redirect("/") //Send to homepage if they have no cookies, should not be able to request to join a trip
    }else{
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userID = decoded.id;
            const result = Trip.passengerRequestToJoinTrip(tripID, userID, decoded);
            if(result.success){
                //Redirect to homepage with a success query paramater
                return res.redirect("/?success=joinTrip");
            }else{
                // Redirect to homepage with an error query parameter
                return res.redirect(`/?error=joinTrip`);
            }
        }catch(err){
            console.log("Error in tripController... passengerRequestToJoinTrip..." , err);
            res.redirect("/?error=serverError") //If error, redirect to homepage.
        }
    }
};

exports.acceptPassengerRequest = async (req, res) => {

};













