-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: student-databases.cvode4s4cwrc.us-west-2.rds.amazonaws.com
-- Generation Time: Dec 02, 2025 at 09:10 PM
-- Server version: 8.0.35
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `harveyholm`
--

-- --------------------------------------------------------

--
-- Table structure for table `distance`
--

CREATE TABLE `distance` (
  `id` int NOT NULL,
  `distance` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `distance`
--

INSERT INTO `distance` (`id`, `distance`) VALUES
(1, 12452500),
(2, 213),
(3, 2);

-- --------------------------------------------------------

--
-- Table structure for table `gyro_main`
--

CREATE TABLE `gyro_main` (
  `id` int NOT NULL,
  `x_axis` float NOT NULL,
  `z_axis` float NOT NULL,
  `y_axis` float NOT NULL,
  `distance_id` int NOT NULL,
  `gyro_time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `gyro_main`
--

INSERT INTO `gyro_main` (`id`, `x_axis`, `z_axis`, `y_axis`, `distance_id`, `gyro_time`) VALUES
(1, 345635, 6423, 634, 1, '00:02:35'),
(2, 987, 546, 123, 2, '00:25:00'),
(3, 654, 197, 593, 3, '00:50:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `distance`
--
ALTER TABLE `distance`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `gyro_main`
--
ALTER TABLE `gyro_main`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `distance`
--
ALTER TABLE `distance`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `gyro_main`
--
ALTER TABLE `gyro_main`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
