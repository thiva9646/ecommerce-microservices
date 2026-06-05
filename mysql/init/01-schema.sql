-- E-commerce MySQL schema (users + orders)
-- Runs automatically when MySQL container starts (docker-entrypoint-initdb.d)

CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    items_json JSON NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Dummy users for learning (no auth)
INSERT INTO users (name, email) VALUES
    ('Alex Morgan', 'alex@example.com'),
    ('Jordan Lee', 'jordan@example.com'),
    ('Sam Rivera', 'sam@example.com')
ON DUPLICATE KEY UPDATE name = VALUES(name);
