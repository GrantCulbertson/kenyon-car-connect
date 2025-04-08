// backend/routes/users.js
// ROUTING FOR USERS OF WEBSITE
const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

//----------------------- ROUTES TO RENDER TRIP PAGES ------------------------//

//Route to page to post a trip
router.get("/postTrip", tripController.postTripPage);

//Route to render your trips page
router.get("/yourTrips", tripController.yourTripsPage);

//Route to render a trip info page
router.get("/viewTrip/:id", tripController.viewTripPage);

//----------------------- ROUTES TO HANDLE TRIP DATA ------------------------//

//Route to create a trip
router.post("/createTrip", tripController.createTrip);

//Route for a passenger to request to join a trip
router.post("/passengerRequestToJoinTrip/:id", tripController.passengerRequestToJoinTrip);

//Route for a driver to accept a request to join their trip
router.post("/acceptPassengerRequest/:id" , tripController.acceptPassengerRequest);

//Route for a driver to deny a request to join their trip
router.post("/denyPassengerRequest/:id" , tripController.denyPassengerRequest);

//Route for a driver to remove a passenger from their trip
router.post("/removePassenger/:id" , tripController.deletePassengerFromTrip)

//Route for a driver to delete a trip:
router.post("/deleteTrip/:id", tripController.deleteTrip);

//Route for a drive to accept a trip request from the feed;
router.post("/acceptTripRequest/:id", tripController.acceptTripRequest);

//Route for a passenger to leave a trip
router.post("/leaveTrip/:id", tripController.leaveTrip);








//Export router
module.exports = router;


