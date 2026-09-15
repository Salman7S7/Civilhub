-- CivilHub Unified MySQL Database Schema
-- Database: civilhub_db

-- 1. Table: designs (Feature 2 - Smart Design Suggestions & Architectural Models)
CREATE TABLE IF NOT EXISTS designs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    floors INT NOT NULL,                             -- Number of stories (e.g. 5, 10)
    has_basement BOOLEAN DEFAULT 0,                  -- Basement available (1/0)
    has_garage BOOLEAN DEFAULT 0,                    -- Car garage / covered bay (1/0)
    rooftop_type VARCHAR(50) DEFAULT 'Open Terrace', -- 'Garden', 'Helipad', 'Open Terrace'
    min_katha DECIMAL(4,2) NOT NULL,                 -- Minimum required land in Katha
    built_area_sqft INT DEFAULT NULL,                -- Total built-up square footage
    units_per_floor INT DEFAULT 1,                   -- Residential units per floor
    unit_size_sqft INT DEFAULT 1500,                 -- Average unit size in sqft
    bedrooms INT DEFAULT 3,                          -- Typical bedrooms per unit
    bathrooms INT DEFAULT 3,                         -- Typical bathrooms per unit
    balconies INT DEFAULT 2,                         -- Typical balconies per unit
    dining_space VARCHAR(150) DEFAULT NULL,          -- Dining layout note
    drawing_space VARCHAR(150) DEFAULT NULL,         -- Drawing/Living layout note
    kitchen_space VARCHAR(150) DEFAULT NULL,         -- Kitchen & utility note
    parking_capacity INT DEFAULT 0,                  -- Total parking spots
    architectural_style VARCHAR(100) DEFAULT NULL,   -- Architectural style name
    image_url VARCHAR(500) NOT NULL,                 -- Architectural elevation image URL
    description TEXT DEFAULT NULL,                   -- Design description
    features JSON DEFAULT NULL,                      -- JSON list of features / amenities
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Table: construction_rates (Feature 3 - Cost Estimator Base Rates)
CREATE TABLE IF NOT EXISTS construction_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grade VARCHAR(50) UNIQUE NOT NULL,               -- 'standard', 'premium', 'luxury'
    rate_per_sqft INT NOT NULL,                      -- Rate in BDT per sqft
    structure_share DECIMAL(4,3) DEFAULT 0.450,      -- e.g. 0.45 (45%)
    finishing_share DECIMAL(4,3) DEFAULT 0.300,      -- e.g. 0.30 (30%)
    electrical_share DECIMAL(4,3) DEFAULT 0.120,     -- e.g. 0.12 (12%)
    plumbing_share DECIMAL(4,3) DEFAULT 0.130,       -- e.g. 0.13 (13%)
    basement_rate_factor DECIMAL(4,2) DEFAULT 1.25,  -- Basement multiplier (1.25x)
    basement_area_factor DECIMAL(4,2) DEFAULT 0.90,  -- Basement footprint factor (0.90x)
    garage_rate_factor DECIMAL(4,2) DEFAULT 0.80,    -- Garage multiplier (0.80x)
    garage_area_sqft INT DEFAULT 250,                -- Standard garage footprint (250 sqft)
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Table: cost_estimates (Feature 3 - Cost Estimation Calculation Logs)
CREATE TABLE IF NOT EXISTS cost_estimates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    floors INT NOT NULL,
    floor_area_sqft INT NOT NULL,
    quality VARCHAR(50) NOT NULL,                    -- 'standard', 'premium', 'luxury'
    has_basement BOOLEAN DEFAULT 0,
    has_garage BOOLEAN DEFAULT 0,
    rate_per_sqft INT NOT NULL,
    total_built_up_area INT NOT NULL,
    structure_cost BIGINT NOT NULL,
    finishing_cost BIGINT NOT NULL,
    electrical_cost BIGINT NOT NULL,
    plumbing_cost BIGINT NOT NULL,
    total_cost_bdt BIGINT NOT NULL,
    design_id INT DEFAULT NULL,                      -- Linked design if estimated from Smart Designs
    design_title VARCHAR(150) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (design_id) REFERENCES designs(id) ON DELETE SET NULL
);

-- 4. Table: feasibility_logs (Feature 1 - Land & Building Code Feasibility Logs)
CREATE TABLE IF NOT EXISTS feasibility_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    land_katha DECIMAL(5,2) NOT NULL,
    road_width_ft DECIMAL(5,2) NOT NULL,
    floors INT NOT NULL,
    authority VARCHAR(50) DEFAULT 'RAJUK',           -- 'RAJUK', 'CDA', 'RDA', 'KDA'
    is_permissible BOOLEAN NOT NULL,
    max_permissible_height VARCHAR(50) DEFAULT NULL,
    far_ratio DECIMAL(4,2) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
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
