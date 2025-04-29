-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 29, 2025 at 05:37 PM
-- Server version: 10.11.8-MariaDB-0ubuntu0.24.04.1
-- PHP Version: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kenyon_car_connect`
--

-- --------------------------------------------------------

--
-- Table structure for table `carData`
--

CREATE TABLE `carData` (
  `userID` int(255) NOT NULL COMMENT 'ID associated with user who owns car',
  `make` varchar(255) DEFAULT NULL COMMENT 'Make of the car (Toyota, Volkswagen, etc.)',
  `model` varchar(255) DEFAULT NULL COMMENT 'Model of the car (Camry, Jetta, etc.)',
  `color` varchar(255) DEFAULT NULL COMMENT 'Color of the vehicle',
  `licensePlate` varchar(255) DEFAULT NULL COMMENT 'License plate of vehicle',
  `seatsInCar` int(255) DEFAULT NULL COMMENT 'Seats available in car',
  `year` int(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='User car data for Kenyon Car Connect';

--
-- Dumping data for table `carData`
--

INSERT INTO `carData` (`userID`, `make`, `model`, `color`, `licensePlate`, `seatsInCar`, `year`) VALUES
(42, 'Volkswagen', 'Jetta', 'Metallic Blue', 'JBY9503', 3, 2017),
(48, 'Volkswagen', 'Tiguan ', 'Gray', 'A32SZN', 3, 2021),
(49, 'Lamborghini', 'Ventador', 'Yellow', 'FAST000', 1, 2025);

-- --------------------------------------------------------

--
-- Table structure for table `rideProfileData`
--

CREATE TABLE `rideProfileData` (
  `userID` int(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `pronouns` varchar(255) DEFAULT NULL,
  `preferredMusic` varchar(255) DEFAULT NULL,
  `conversationPreference` varchar(255) DEFAULT NULL,
  `bio` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rideProfileData`
--

INSERT INTO `rideProfileData` (`userID`, `name`, `pronouns`, `preferredMusic`, `conversationPreference`, `bio`) VALUES
(42, 'Grant Culbertson', 'He/Him', 'Gucci Mane', 'Some small talk', 'I am a senior economics major graduating this semester. I love trips to Tim Hortons!'),
(48, 'Josh Bergman', 'Him', 'Drake', 'Silence is preferred', 'I am friends with the creator'),
(49, 'James Skon', 'He/Him', 'German Dance Hall Music', 'Some small talk', 'I teach computer science classes at Kenyon.');

-- --------------------------------------------------------

--
-- Table structure for table `tripData`
--

CREATE TABLE `tripData` (
  `id` int(255) NOT NULL,
  `posterID` int(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `openSeats` int(255) DEFAULT NULL,
  `origin` varchar(255) NOT NULL,
  `destination` varchar(255) NOT NULL,
  `locationDetails` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'This JSON contains latitude and longitude for the origin and destination of the trip' CHECK (json_valid(`locationDetails`)),
  `distance` varchar(255) NOT NULL,
  `stops` varchar(255) DEFAULT NULL,
  `length` varchar(255) NOT NULL,
  `roundtrip` varchar(255) NOT NULL,
  `payment` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `time` time(6) NOT NULL,
  `tripStatus` varchar(255) NOT NULL,
  `tripType` varchar(255) NOT NULL,
  `postDate` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='This table holds data for all trips';

--
-- Dumping data for table `tripData`
--

INSERT INTO `tripData` (`id`, `posterID`, `title`, `comments`, `openSeats`, `origin`, `destination`, `locationDetails`, `distance`, `stops`, `length`, `roundtrip`, `payment`, `date`, `time`, `tripStatus`, `tripType`, `postDate`) VALUES
(51, 42, 'Heading to Tims', 'Anybody want to to ride along, buy my drink?', 2, 'South 1', 'Tim Hortons, 941 Coshocton Ave, Mt Vernon, OH 43050, USA', '{\"originLat\":\"40.3755\",\"originLng\":\"-82.3977\",\"destinationLat\":\"40.4009912\",\"destinationLng\":\"-82.4547645\"}', '5.2 mi', '1', '9 mins', 'No', '$10', '2025-04-06', '01:00:00.000000', 'Closed', 'Providing a ride', '2025-04-04'),
(55, 48, 'Columbus on Tuesday?', 'Anybody want to hit Columbus on Tuesday?', 2, 'Campus', 'Columbus, OH, USA', '{\"originLat\":\"40.3755\",\"originLng\":\"-82.3977\",\"destinationLat\":\"39.9625112\",\"destinationLng\":\"-83.0032218\"}', '57.5 mi', '1', '1 hour 6 mins', 'No', 'I\'ll pay for gas!', '2025-04-08', '10:00:00.000000', 'Closed', 'Providing a ride', '2025-04-08'),
(63, 42, 'test', 'comment', NULL, 'Campus', 'Tim Hortons, 941 Coshocton Ave, Mt Vernon, OH 43050, USA', '{\"originLat\":\"40.3755\",\"originLng\":\"-82.3977\",\"destinationLat\":\"40.4009912\",\"destinationLng\":\"-82.4547645\"}', '10.4 mi', '1', '18 mins', 'Yes', 'test', '2025-04-12', '18:17:00.000000', 'Closed', 'Requesting a ride', '2025-04-12'),
(64, 42, 'TEST', 'testing', NULL, 'Campus', 'Walmart Supercenter, 1575 Coshocton Ave, Mt Vernon, OH 43050, USA', '{\"originLat\":\"40.3755\",\"originLng\":\"-82.3977\",\"destinationLat\":\"40.40463769999999\",\"destinationLng\":\"-82.4422152\"}', '4.6 mi', '1', '8 mins', 'No', '$10', '2025-04-12', '18:30:00.000000', 'Closed', 'Requesting a ride', '2025-04-12'),
(65, 42, 'Heading back to NYC after graduation', 'Anybody want to ride along to NYC after graduation?', 1, 'Watson Lot', 'New York, NY, USA', '{\"originLat\":\"40.3755\",\"originLng\":\"-82.3977\",\"destinationLat\":\"40.7127753\",\"destinationLng\":\"-74.0059728\"}', '528 mi', '1', '8 hours 21 mins', 'No', 'Pay for half of gas', '2025-05-17', '10:00:00.000000', 'Open', 'Providing a ride', '2025-04-13'),
(68, 42, 'Trip to Tims?', 'I\'m heading to Tims tomorrow morning, anybody want to ride along?', 3, 'Watson parking lot', 'Tim Hortons, 941 Coshocton Ave, Mt Vernon, OH 43050, USA', '{\"originLat\":\"40.3755\",\"originLng\":\"-82.3977\",\"destinationLat\":\"40.4009912\",\"destinationLng\":\"-82.4547645\"}', '5.2 mi', '1', '9 mins', 'No', 'Buy my drink', '2025-04-25', '10:00:00.000000', 'Closed', 'Providing a ride', '2025-04-24'),
(72, 48, 'Take me to tims please?', 'Anybody willing to take me to tims later?', 2, 'Campus', 'Tim Hortons, 941 Coshocton Ave, Mt Vernon, OH 43050, USA', '{\"originLat\":\"40.3755\",\"originLng\":\"-82.3977\",\"destinationLat\":\"40.4009912\",\"destinationLng\":\"-82.4547645\"}', '10.4 mi', '1', '18 mins', 'Yes', '$15', '2025-04-29', '16:30:00.000000', 'In Progress', 'Providing a ride', '2025-04-29');

-- --------------------------------------------------------

--
-- Table structure for table `tripPassengers`
--

CREATE TABLE `tripPassengers` (
  `id` int(11) NOT NULL,
  `tripID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `passengerStatus` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tripPassengers`
--

INSERT INTO `tripPassengers` (`id`, `tripID`, `userID`, `passengerStatus`) VALUES
(44, 51, 42, 'Driver'),
(58, 55, 48, 'Driver'),
(59, 55, 42, 'Accepted'),
(60, 51, 48, 'Accepted'),
(66, 65, 42, 'Driver'),
(72, 65, 50, 'Accepted'),
(73, 65, 48, 'Accepted'),
(74, 68, 42, 'Driver'),
(81, 72, 48, 'Driver'),
(82, 72, 42, 'Accepted');

-- --------------------------------------------------------

--
-- Table structure for table `userData`
--

CREATE TABLE `userData` (
  `id` int(255) NOT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `age` int(255) DEFAULT NULL,
  `has_car` varchar(255) DEFAULT 'no',
  `emailValidationCode` int(255) DEFAULT NULL,
  `verificationStatus` varchar(255) NOT NULL DEFAULT 'No'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Stores kenyon car connect user information';

--
-- Dumping data for table `userData`
--

INSERT INTO `userData` (`id`, `firstName`, `lastName`, `email`, `password`, `age`, `has_car`, `emailValidationCode`, `verificationStatus`) VALUES
(42, 'Grant', 'Culbertson', 'culbertson2@kenyon.edu', 'Password123', 21, 'yes', 5773, 'Yes'),
(48, 'Josh', 'Bergman', 'bergman1@kenyon.edu', 'Password123', 21, 'yes', 7517, 'Yes'),
(49, 'James', 'Skon', 'skonjp@kenyon.edu', 'Password123', 20, 'yes', 3329, 'Yes'),
(50, 'Harry', 'Barrs', 'barrs1@kenyon.edu', 'Password123', 21, 'no', 5773, 'Yes'),
(52, 'Josh', 'Hertz', 'hertz1@kenyon.edu', 'Password123', 21, 'no', 8110, 'No');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carData`
--
ALTER TABLE `carData`
  ADD PRIMARY KEY (`userID`);

--
-- Indexes for table `rideProfileData`
--
ALTER TABLE `rideProfileData`
  ADD PRIMARY KEY (`userID`);

--
-- Indexes for table `tripData`
--
ALTER TABLE `tripData`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_posterID` (`posterID`);

--
-- Indexes for table `tripPassengers`
--
ALTER TABLE `tripPassengers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tripID` (`tripID`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `userData`
--
ALTER TABLE `userData`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tripData`
--
ALTER TABLE `tripData`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `tripPassengers`
--
ALTER TABLE `tripPassengers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `userData`
--
ALTER TABLE `userData`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tripData`
--
ALTER TABLE `tripData`
  ADD CONSTRAINT `fk_posterID` FOREIGN KEY (`posterID`) REFERENCES `userData` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tripPassengers`
--
ALTER TABLE `tripPassengers`
  ADD CONSTRAINT `tripPassengers_ibfk_1` FOREIGN KEY (`tripID`) REFERENCES `tripData` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tripPassengers_ibfk_2` FOREIGN KEY (`userID`) REFERENCES `userData` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
