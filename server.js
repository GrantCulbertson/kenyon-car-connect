// Load in necessary packages
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


// Setup view engine & set it to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend/Public/Views'));

// Setup static files to be served from the "public" directory
app.use(express.static('public'));


// Test Connection to database
db.pool.getConnection()
  .then(conn => {
    console.log("Connected to database... nice!");
    conn.release();
  })
  .catch(err => console.error("Database connection failed... not so nice :( ):", err));

//Define route directories:
const userRoutes = require('./backend/routes/userRoutes');


//Routes:
app.use('/User', userRoutes);




// Serving the webpage
app.get('/', (req, res) => {
  res.render('homepage');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));