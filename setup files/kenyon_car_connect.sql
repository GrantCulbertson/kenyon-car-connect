-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 17, 2025 at 06:16 PM
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
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tripPassengers`
--
ALTER TABLE `tripPassengers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `userData`
--
ALTER TABLE `userData`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT;

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
