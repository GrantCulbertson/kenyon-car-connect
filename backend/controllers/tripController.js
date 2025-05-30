//Add in required constants:
//const Trip = require("../models/tripModel").Trip; //Require Trip model
const e = require("express");
const jwt = require("jsonwebtoken");
const Trip = require("../models/tripModel").Trip; //Require User model
const Car = require("../models/carModel").Car; //Require car model
const RideProfile = require("../models/rideProfileModel").rideProfile; //Require ride profile model
const User = require("../models/userModel").User; //Require user model
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


    if (isNaN(tripId)){
        return res.status(400).send("Invalid trip ID"); // Validate trip ID (recommendation of GPT)
    }

        try{
            const trip = await Trip.getTripById(tripId);
            if(trip){
                //Get passengers that are part of the trip (set  to empty array if no passengers)
                trip.passengers = (await Trip.getTripPassengers(trip.id)) || [];
                //Get ride profiles associated with trip passengers
                for (const passenger of trip.passengers){
                    console.log(passenger);
                    const rideProfile = await RideProfile.getRideProfileByUserID(passenger.id);
                    if(rideProfile){
                        passenger.rideProfile = rideProfile;
                    }else{
                        passenger.rideProfile = null;
                    }
                }

                //Get car information associated with the trip (if there is a car)
                const car = await Car.getCarByUserID(trip.posterID);
                if(car){
                    trip.car = car;
                }else{
                    trip.car = null;
                }

                //Get zoom level needed for map on page
                const zoomLevel = await Trip.calculateZoomLevel(trip.leavingFromLat, trip.leavingFromLng, trip.destinationLat, trip.destinationLng, 300,300); //Get zoom level for map
                trip.zoomLevel = zoomLevel; //Add zoom level to trip object
                return res.render("trip", {trip, GoogleMapsAPIKey: process.env.GOOGLE_MAPS_API_KEY});
            }else{
                res.status(404).send('Oops... trip not found');
            }
        }catch (err){
            console.log("Error in tripController... viewTripPage...", err);
            res.redirect("/"); //Return to homepage if there is an error
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

                //Add ride profiles to passengers:
                for (const trip of trips) {
                    for (const passenger of trip.passengersRequesting) {
                        const rideProfile = await RideProfile.getRideProfileByUserID(passenger.id);
                        if (rideProfile) {
                            passenger.rideProfile = rideProfile; // Correct reference
                        } else {
                            passenger.rideProfile = null;
                        }
                    }
                }

                //Render the your trips page and pass the trips associated with the user
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

//---------------------- FUNCTIONS FOR TRIP MANAGEMENT -------------------//

//Function to create a trip from the posting page
exports.createTrip = async (req, res) => {
    console.log("tripController... createTrip... running");
    const token = req.cookies.auth_token; // Get token from cookies
    if(!token){
        return res.redirect("/?error=notLoggedIn");; //Send user back to homepage if they don't have cookies, although they shouldn't be able to do this anyways if they don't have cookies
    }else{ //If they have cookies proceed with adding the trip to the database
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET); //Decode the token
            const posterID = decoded.id; //Get the user id from the decoded token

            //Make sure that the user is verified and return them to the homepage if they are not:
            if(decoded.verificationStatus === "No"){
                return res.redirect("/?error=notVerified"); //Redirect to homepage if user is not verified
            }

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

//Function to accept a request to join a trip from the your trips page
exports.acceptTripRequest = async (req, res) => {
    console.log("tripController... acceptTripRequest... running");
    const token = req.cookies.auth_token; // Get token from cookies
    const tripID = req.params.id; //Grab trip ID from route
    const tripPosterID = req.query.tripPosterID; //Get trip poster ID from query param in URL

    if(!token){
        return res.redirect("/?error=notLoggedIn"); //Return to homepage if user is not logged in, you must be logged in to accept a trip request
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET); //Decode the token
        const userID = decoded.id; //Get the user id from the decoded token

        //Make sure that the user is verified and return them to the homepage if they are not:
        if(decoded.verificationStatus === "No"){
            return res.redirect("/?error=notVerified"); //Redirect to homepage if user is not verified
        }

        //Make sure that the user has a car to be able to accept the trip
        const car = await Car.getCarByUserID(userID);
        console.log(car);
        if(!car){
            return res.redirect("/?error=noCar");
        }

        //Move ahead with accepting the trip request since user is verified
        const requestStatus = await Trip.acceptTripRequest(tripID, userID, tripPosterID); //Accept the trip request
        if(requestStatus.success){
            res.redirect('/Trips/yourTrips'); //Redirect to your trips page if trip is accepted successfully
        }else{
            res.redirect('/Trips/viewTrip/' + tripID + '?error=acceptTripRequest'); //Redirect to trip page with error if trip is not accepted successfully
        }
    }catch (error){
        console.log("Error in tripController... acceptTripRequest...", error);
        res.redirect("/?error=serverError"); //If error, redirect to homepage
    }

}

//Function for a driver to delete their trip
exports.deleteTrip = async (req, res) => {
    console.log("tripController... deleteTrip... running");
    const token = req.cookies.auth_token; // Get token from cookies 
    const tripID = req.params.id; //Get trip ID from URL
    if(!token){
        return res.redirect("/?error=notLoggedIn");; //Return to homepage if user is not logged in, you must be logged in to delete a trip
    }

    //Return user to homepage with error if they are not verified
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //Decode the token
    if(decoded.verificationStatus === "No"){
        return res.redirect("/?error=notVerified"); //Redirect to homepage if user is not verified
    }

    try{
        const requestStatus = await Trip.deleteTrip(tripID); //Delete the trip from the database
        if(requestStatus.success){
            res.redirect('/Trips/yourTrips'); //Redirect to your trips page if trip is deleted successfully
        }else{
            res.redirect('/Trips/viewTrip/' + tripID + '?error=deleteTrip'); //Redirect to trip page with error if trip is not deleted successfully
        }
    }catch(error){
        console.log("Error in tripController... deleteTrip...", error);
        res.redirect("/Trips/viewTrip/" + tripID + '?error=serverError'); //If error, redirect to trip page with error message
    }
};

//Function for a passenger to request to join a trip
exports.passengerRequestToJoinTrip = async (req,res) => {
    console.log("tripController... passengerRequestToJoinTrip... running");
    const token = req.cookies.auth_token;
    const tripID = req.params.id; //Grab trip ID from page URL
    if(!token){
        return res.redirect("/?error=notLoggedIn") //Send to homepage if they have no cookies, should not be able to request to join a trip
    }

    //Return user to homepage with error if they are not verified
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //Decode the token
    if(decoded.verificationStatus === "No"){
        return res.redirect("/?error=notVerified"); //Redirect to homepage if user is not verified
    }

    //Check whether the user has already requested to join the trip (return to homepage with error if they have)
    const userID = decoded.id;
    const request = await Trip.checkForPassengerRequest(tripID, userID);
    if(request.success === true){
        return res.redirect("/?error=alreadyRequested"); //Redirect to homepage if user has already requested to join the trip
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userID = decoded.id;
        const result = await Trip.passengerRequestToJoinTrip(tripID, userID, decoded);
        console.log(result.success);
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

};

//Function to accept a passengers request to join a trip from the yourTrips page
exports.acceptPassengerRequest = async (req, res) => {
    console.log("tripController... acceptPassengerRequest... running");
    const token = req.cookies.auth_token;
    if(!token){
        return res.redirect("/?error=notLoggedIn"); //Shouldn't be able to accept passengers if they aren't logged in
    }

    //Return user to homepage with error if they are not verified
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //Decode the token
    if(decoded.verificationStatus === "No"){
        return res.redirect("/?error=notVerified"); //Redirect to homepage if user is not verified
    }

    try{
        const passengerID = req.params.id; //Get passed passengerID from URL
        const tripID = req.query.tripID; //Get passed tripID from query param in URL

        const requestStatus = await Trip.acceptPassengerRequest(tripID, passengerID);
        //Redirect to yourTrips page with success if request was sent successfully
        if(requestStatus.full === false && requestStatus.success){
            res.redirect('/Trips/yourTrips');
        //Redirect to yourTrips page with failure if request was not successful
        }else if(requestStatus.full === false && requestStatus.success === false){
            res.redirect('/Trips/yourTrips?error=acceptPassengerRequest');
        //Redirect to yourTrips page with error that the trip is full and you can't accept more riders
        }else if (requestStatus.full === true){
            res.redirect('/Trips/yourTrips?error=tripFull');
        }
    }catch (error){
        console.log("Error in tripController... acceptPassengerRequest...", error);
        res.redirect('/Trips/yourTrips?error=serverError');
    }
    
};

//Function to deny a passengers request from the yourTrips page
exports.denyPassengerRequest = async (req, res) => {
    console.log("tripController... denyPassengerRequest... running");
    const token = req.cookies.auth_token;
    if(!token){
        return res.redirect("/?error=notLoggedIn"); //Shouldn't be able to accept if they aren't logged in
    }

    //Return user to homepage with error if they are not verified
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //Decode the token
    if(decoded.verificationStatus === "No"){
        return res.redirect("/?error=notVerified"); //Redirect to homepage if user is not verified
    }

    try{
        const passengerID = req.params.id; //Get passed passengerID from URL
        const tripID = req.query.tripID; //Get passed tripID from query param in URL

        const requestStatus = await Trip.denyPassengerRequest(tripID, passengerID);
        //Redirect to yourTrips page with success if request was sent successfully
        if(requestStatus.success){
            res.redirect('/Trips/yourTrips');
        }else{
        //Redirect to yourTrips page with failure if request was not successful
            res.redirect('/Trips/yourTrips?error=denyPassengerRequest');
        }
    }catch (error){
        console.log("Error in tripController... denyPassengerRequest...", error);
        res.redirect('/Trips/yourTrips?error=serverError');
    }

};

//Function to remove a passenger from a trip
exports.deletePassengerFromTrip = async (req, res) => {
    console.log("tripController... deletePassengerFromTrip... running");
    const token = req.cookies.auth_token;
    const passengerID = req.params.id; //Get passed passengerID from URL
    const tripID = req.query.tripID; //Get passed tripID from query param in URL
    if(!token){
        return res.redirect("/?error=notLoggedIn"); //Shouldn't be able to deny a passenger if you aren't logged in
    }

    //Return user to homepage with error if they are not verified
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //Decode the token
    if(decoded.verificationStatus === "No"){
        return res.redirect("/?error=notVerified"); //Redirect to homepage if user is not verified
    }

    //Move ahead with deleting the passenger from the trip
    try{
        const requestStatus = await Trip.deletePassengerFromTrip(tripID, passengerID);
        if(requestStatus.success){
        //Redirect to trip page if passenger is removed successfully
            res.redirect('/Trips/viewTrip/' + tripID);
        }else{
        //Redirect to trip page with failure if request was not successful
            res.redirect('/Trips/viewTrip/' + tripID + '?error=removePassenger');
        }
    }catch (error){
        console.log("error in tripController... deletePassengerFromTrip...", error);
        res.redirect('/Trips/viewTrip/' + tripID + '?error=serverError')
    }
}

//Function for a passenger to leave a trip
exports.leaveTrip = async (req, res) => {
    console.log("tripController... leaveTrip... running");
    const token = req.cookies.auth_token; //Get token from cookies

    //Return to homepage if user is not logged in
    if(!token){
        return res.redirect("/?error=notLoggedIn"); //Shouldn't be able to leave a trip if they aren't logged in
    }

    //Move ahead with letting the user leave the trip
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET); //Decode the token
        const userID = decoded.id;
        const tripID = req.params.id; //Get the trip ID from the route url

        const requestStatus = await Trip.leaveTrip(tripID, userID); //Leave the trip
        if(requestStatus.success){
            //Redirect to your trips page if passenger is removed successfully
            res.redirect('/Trips/yourTrips');
        }else{
            //Redirect to trip page with failure if request was not successful
            res.redirect('/Trips/viewTrip/' + tripID + '?error=leaveTrip');
        }
    }catch(error){
        console.log("Error in tripController... leaveTrip...", error);
        res.redirect("/?error=serverError") //If error, redirect to homepage with error message
    }
}















