const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend/Public/Views'));

// Serve static files from the "public" directory
app.use(express.static('public'));

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 5,
});

// Test DB Connection
pool.getConnection()
  .then(conn => {
    console.log("Connected to database");
    conn.release();
  })
  .catch(err => console.error("Database connection failed:", err));

// Route to render homepage.ejs
app.get('/', (req, res) => {
  res.render('homepage');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));