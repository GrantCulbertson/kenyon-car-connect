// backend/routes/users.js
// ROUTING FOR USER CARS
const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');


//----------------------- ROUTES TO HANDLE CAR DATA ------------------------//

//Route to add a car to the database
router.post("/AddCar", carController.addCar);









//Export router
module.exports = router;


