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

//----------------------- ROUTES TO HANDLE TRIP DATA ------------------------//

router.post("/createTrip", tripController.createTrip);







//Export router
module.exports = router;


