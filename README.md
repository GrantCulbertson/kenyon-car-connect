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

### 6. **Config**:
   - Stores configuration files, such as database connection settings.

### 7. **Makefile**:
   - Used for defining build and deployment tasks.

---

## Requirements

To run the project, ensure the following prerequisites are met:

1. **Node.js** and **npm** installed.
2. **MariaDB** database set up and running.
3. **Apache2** server configured for the MariaDB database.

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
   - Update the database connection settings in the `config` directory.

4. Start the application:
   ```bash
   npm start
   ```

5. Visit the application in your browser at `http://localhost:5000`.

---

## Contact

For questions or feedback, please contact me at [My GitHub profile](https://github.com/GrantCulbertson).

---

Let me know if you'd like any further adjustments!
