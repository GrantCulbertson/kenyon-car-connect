// backend/routes/users.js
// ROUTING FOR USER CARS
const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');


//----------------------- ROUTES TO HANDLE CAR DATA ------------------------//

//Route to add a car to the database
router.post("/AddCar", carController.addCar);

//Route to update a car in the database
router.post("/UpdateCar", carController.updateCar);









//Export router
module.exports = router;


