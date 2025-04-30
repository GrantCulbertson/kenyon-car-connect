// Load in necessary packages & import models
require('dotenv').config();
require('./scheduler');
const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware to make cookies available to all views (webpages)
app.use((req, res, next) => {
  if (req.cookies.auth_token) {
      try {
          const decoded = jwt.verify(req.cookies.auth_token, process.env.JWT_SECRET);
          res.locals.user = decoded;
          res.locals.isUser = true;
      } catch (error) {
          res.locals.user = null;
          res.locals.isUser = false;
      }
  } else {
      res.locals.user = null;
      res.locals.isUser = false;
  }
  next();
});

// Middleware to make user request count available on every page
app.use(async (req, res, next) => {
  if (req.cookies.auth_token) {
    try {
      const decoded = jwt.verify(req.cookies.auth_token, process.env.JWT_SECRET);
      const userID = decoded.id;

      // Fetch the trip request count
      const requestCount = await Trip.countTripRequestsByUser(userID);

      // Make the request count available to all views
      res.locals.requestCount = requestCount;
    } catch (error) {
      console.log("Error in fetching trip request count:", error);
      res.locals.requestCount = 0; // Default to 0 if there's an error
    }
  } else {
    res.locals.requestCount = 0; // Default to 0 if the user is not logged in
  }
  next();
});

//Middleware to make sure users are always on an https connections
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// Setup view engine & set it to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend/Public/Views'));

// Setup static files to be served from the "frontend/public" directory
app.use(express.static(path.join(__dirname, 'frontend/Public')));

// Test Connection to database
db.pool.getConnection()
  .then(conn => {
    console.log("Connected to database... nice!");
    conn.release();
  })
  .catch(err => console.error("Database connection failed... not so nice :( ):", err));



//Define route directories:
const userRoutes = require('./backend/routes/userRoutes');
const carRoutes = require('./backend/routes/carRoutes');
const rideProfileRoutes = require('./backend/routes/rideProfileRoutes');
const tripRoutes = require('./backend/routes/tripRoutes');


//Routes:
app.use('/User', userRoutes);
app.use('/Car', carRoutes);
app.use('/rideProfile', rideProfileRoutes);
app.use('/Trips',tripRoutes);


//Import the Trip & User Model
const {Trip} = require('./backend/models/tripModel');


// Serving the homepage and trip feed
app.get('/', async (req, res) => {
  try{
    const trips = await Trip.getAllTrips();

    //Get zoom level for map of each trip
    if(trips){
    trips.forEach(trip => {
      trip.zoomLevel = Trip.calculateZoomLevel((trip.leavingFromLat, trip.leavingFromLng, trip.destinationLat, trip.destinationLng, 300,300)); // Default zoom level
    });
    }

    //Render the homepage with the trips data
    if(trips){
      res.render('homepage', {trips, GoogleMapsAPIKey: process.env.GOOGLE_MAPS_API_KEY});
    }else{
      res.render('homepage', {trips: [], GoogleMapsAPIKey: process.env.GOOGLE_MAPS_API_KEY});
    }
  } catch (error){
    console.log("Error in rendering homepage:", error);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));