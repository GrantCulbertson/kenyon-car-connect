# Kenyon Car Connect

## Overview

Kenyon Car Connect is a web-based platform designed to streamline carpooling and ride-sharing for students at Kenyon College (or anywhere else). The platform allows users to connect with one another, organize rides, and reduce their carbon footprint by sharing transportation.

This project is built using **Node.js** and **Express** for the backend. It also requires a **MariaDB** database running on an **Apache2** server for data persistence and management. The application leverages [EJS](https://ejs.co/) for templating, JavaScript for interactivity, and CSS for styling.

---

## Features

- **User Registration and Login**: Secure user authentication to manage rides and profiles.
- **Ride Listings**: Create, view, and join available carpool rides.
- **Responsive Design**: Works seamlessly on desktops, tablets, and mobile devices.
- **Environmentally Friendly**: Encourages carpooling to reduce carbon emissions.

---

## Project Structure

The project uses a modular structure to organize code for scalability and maintainability. Below is an overview of its key components:

### 1. **Views (EJS Files)**:
   - Responsible for rendering dynamic HTML content.
   - Located in the `frontend/public/views` directory.
   - Includes templates for pages such as:
     - `index.ejs`: Landing page.
     - `rides.ejs`: Display of ride listings.
     - `profile.ejs`: User profile management.

### 2. **Public (Static Assets)**:
   - Contains static files for CSS.
   - Organized as follows:
     - `frontend/public/css`: Styling file for application.

### 3. **Routes**:
   - Defines the backend logic for handling HTTP requests.
   - Located in the `backend/routes` directory.
   - Includes routes for:
     - `/tripRoutes`: Trip-related actions & pages.
     - `/rideProfileRoutes`: Ride-profile-related actions.
     - `/userRoutes`: User-related actions & pages.
     - `/carRoutes`: Car-related actions & pages.


### 4. **Controllers**:
   - Contains business logic for handling user actions.
   - Bridges the gap between routes and views.
   - Includes controllers for:
     - `/tripContoller`: Trip-related functions.
     - `/rideProfileController`: Ride-profile-related functions.
     - `/userController`: User-related functions.
     - `/carController`: Car-related functions.

### 5. **Models**:
   - Defines the data structure and database interaction logic.
   - Includes class structure & schema for:
     - `/tripModel`: Trip-class & tripData functions.
     - `/rideProfileController`: Ride-profile-class & rideProfileData functions.
     - `/userController`: User-class & userData functions.
     - `/carController`: Car-class & carData functions.

### 6. **Env**:
   - Stores configuration files, such as database connection settings, and API keys.
   - Please look at `example env file` to see how it should be setup.

### 6.5 **Thid party APIs** ###
   - Make sure you update the API keys in the env file...
   - For email services I used [brevo](https://www.brevo.com/) as it has a good free tier.
   - For the google maps on the webpages you will need a [google cloud](https://cloud.google.com/?hl=en) account with an enabled API that has credentials for Places, Maps Javascript, Geocoding, Places, Routes, Distance Matrix, and Maps Static.

### 7. **Makefile**:
   - Used for defining build and deploying the website.

---

## Requirements

To run the project, ensure the following prerequisites are met:

1. **Node.js + Express.js** and **npm** installed.
2. **MariaDB** database set up and running.
3. **Apache2** server configured for the MariaDB database.
4. **ENV** make sure the ENV file is configured properly... update the API keys to use yours.

---

## Installation

Follow these steps to set up and run the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/GrantCulbertson/kenyon-car-connect.git
   cd kenyon-car-connect
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the database:
   - Set up a MariaDB database using Apache2.
   - Run `kenyon_car_connect.sql` on your MariaDB instance to generate the data-tables for this program.
   - Update the database connection settings in `db.js`.

4. Update the ENV file:
   - Update API keys as needed (google & brevo).
   - Set JWT secret password to whatever you like.
   - Configure database username & password to be used in db.js to access your database.

6. Start the application:
   ```bash
   make
   ```

7. Visit the application in your browser at `http://localhost:5000`.

---

## Contact

For questions or feedback, please contact me at [My GitHub profile](https://github.com/GrantCulbertson).
