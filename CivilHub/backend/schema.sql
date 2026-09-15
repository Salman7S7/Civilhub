-- CivilHub Feature 2: Smart Design Suggestions Database Schema
-- Table: designs

CREATE TABLE IF NOT EXISTS designs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    floors INT NOT NULL,                          -- Number of stories (e.g. 5, 10)
    has_basement BOOLEAN DEFAULT 0,               -- Basement available (1/0)
    has_garage BOOLEAN DEFAULT 0,                 -- Car garage / covered bay (1/0)
    rooftop_type VARCHAR(50) DEFAULT 'Open Terrace', -- 'Garden', 'Helipad', 'Open Terrace'
    min_katha DECIMAL(4,2) NOT NULL,              -- Minimum required land in Katha
    built_area_sqft INT DEFAULT NULL,             -- Total built-up square footage
    units_per_floor INT DEFAULT 1,                -- Residential units per floor
    parking_capacity INT DEFAULT 0,               -- Total parking spots
    architectural_style VARCHAR(100) DEFAULT NULL,-- Architectural style name
    image_url VARCHAR(500) NOT NULL,              -- Architectural elevation image URL
    description TEXT DEFAULT NULL,                -- Design description
    features JSON DEFAULT NULL,                   -- JSON list of features / amenities
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
