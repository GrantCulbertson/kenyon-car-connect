// backend/routes/rideProfileRoutes.js
// ROUTING FOR RIDE PROFILES OF WEBSITE
const express = require('express');
const router = express.Router();
const rideProfileController = require('../controllers/rideProfileController');



//----------------------- ROUTES TO HANDLE USER DATA ------------------------//

//Route to add a ride profile to the database
router.post("/AddRideProfile", rideProfileController.addRideProfile);

//Route to update an existing ride profile
router.post("/UpdateRideProfile", rideProfileController.updateRideProfile);


module.exports = router;