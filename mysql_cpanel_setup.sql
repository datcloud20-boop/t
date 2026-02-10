-- ==========================================================
-- DAT CLOUDE | CPANEL (MYSQL/MARIADB) DATABASE SCHEMA
-- ==========================================================
-- This script handles Users, Projects, Messages, and Site Settings.
-- Optimized for phpMyAdmin / cPanel.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- 1. TABLE: `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(100) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 2. TABLE: `projects`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `projects` (
  `id` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) NOT NULL,
  `tags` json DEFAULT NULL,
  `thumbnail_url` text DEFAULT NULL,
  `media_url` text DEFAULT NULL,
  `tools` json DEFAULT NULL,
  `status` enum('Published','Draft','Featured') DEFAULT 'Published',
  `price` decimal(10,2) DEFAULT 0.00,
  `client` varchar(255) DEFAULT NULL,
  `live_url` text DEFAULT NULL,
  `github_url` text DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 3. TABLE: `messages`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `messages` (
  `id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `service` varchar(100) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 4. TABLE: `site_config`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_config` (
  `id` int(11) NOT NULL DEFAULT 1,
  `logo_text` varchar(100) DEFAULT 'DAT CLOUDE',
  `logo_image_url` text DEFAULT NULL,
  `logo_position` varchar(20) DEFAULT 'left',
  `logo_x` int(11) DEFAULT 0,
  `logo_y` int(11) DEFAULT 0,
  `footer_description` text DEFAULT NULL,
  `hero_title` text DEFAULT NULL,
  `hero_subtitle` text DEFAULT NULL,
  `hero_image_url` text DEFAULT NULL,
  `hero_video_url` text DEFAULT NULL,
  `hero_video_opacity` int(11) DEFAULT 100,
  `hero_text_color` varchar(20) DEFAULT '#ffffff',
  `hero_text_position` varchar(20) DEFAULT 'left',
  `hero_title_size` decimal(5,2) DEFAULT 6.80,
  `hero_image_size` int(11) DEFAULT 90,
  `hero_image_x` int(11) DEFAULT 0,
  `hero_image_y` int(11) DEFAULT 0,
  `stats` json DEFAULT NULL,
  `socials` json DEFAULT NULL,
  `tools` json DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT 'datcloud20@gmail.com',
  `whatsapp_number` varchar(50) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 5. INITIAL SEED DATA
-- --------------------------------------------------------

INSERT INTO `site_config` (
    `id`, `logo_text`, `footer_description`, `hero_title`, `hero_subtitle`, 
    `stats`, `socials`, `tools`, `hero_title_size`, `hero_image_size`
) VALUES (
    1, 
    'DAT CLOUDE', 
    'A high-end portfolio and service-based e-commerce platform for creative professionals.',
    'DESIGNING THE FUTURE OF DIGITAL EXPERIENCES.',
    'We turn bold ideas into high-converting solutions.',
    '{"years": 8, "clients": 45, "projects": 120}',
    '{"linkedin": "#", "instagram": "#"}',
    '[]',
    6.80,
    90
) ON DUPLICATE KEY UPDATE `id`=1;

COMMIT;