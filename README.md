Certainly! Here's the updated README file with the additional information about Node.js, Express, and the MariaDB database requirement:

---

# Kenyon Car Connect

## Overview

Kenyon Car Connect is a web-based platform designed to streamline carpooling and ride-sharing for students and staff at Kenyon College. The platform allows users to connect with one another, organize rides, and reduce their carbon footprint by sharing transportation.

This project is built using **Node.js** and **Express** for the backend. It also requires a **MariaDB** database running on an **Apache2** server for data persistence and management. The application leverages [EJS](https://ejs.co/) for templating, JavaScript for interactivity, and CSS for styling.

---

## Features

- **User Registration and Login**: Secure user authentication to manage rides and profiles.
- **Ride Listings**: Create, view, and join available carpool rides.
- **Search Functionality**: Find rides based on destination, date, or time.
- **Responsive Design**: Works seamlessly on desktops, tablets, and mobile devices.
- **Environmentally Friendly**: Encourages carpooling to reduce carbon emissions.

---

## Project Structure

The project uses a modular structure to organize code for scalability and maintainability. Below is an overview of its key components:

### 1. **Views (EJS Files)**:
   - Responsible for rendering dynamic HTML content.
   - Located in the `views` directory.
   - Includes templates for pages such as:
     - `index.ejs`: Landing page.
     - `rides.ejs`: Display of ride listings.
     - `profile.ejs`: User profile management.

### 2. **Public (Static Assets)**:
   - Contains static files like CSS, JavaScript, and images.
   - Organized as follows:
     - `public/css`: Styling files.
     - `public/js`: Frontend scripts for interactivity.
     - `public/images`: Images used throughout the site.

### 3. **Routes**:
   - Defines the backend logic for handling HTTP requests.
   - Located in the `routes` directory.
   - Includes routes for:
     - `/`: Home and landing page.
     - `/rides`: Ride-related actions.
     - `/users`: User-related actions.

### 4. **Controllers**:
   - Contains business logic for handling user actions.
   - Bridges the gap between routes and views.

### 5. **Models**:
   - Defines the data structure and database interaction logic.
   - Typically includes schemas for users, rides, etc.

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
