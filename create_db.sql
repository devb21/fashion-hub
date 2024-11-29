# Create database script for Fashion Hub

# Create the database
CREATE DATABASE IF NOT EXISTS fashion_hub;
USE fashion_hub;


# Create the app user
CREATE USER IF NOT EXISTS 'fashion_hub_app'@'localhost' IDENTIFIED BY 'fashionyuiop'; 
GRANT ALL PRIVILEGES ON fashion_hub.* TO ' fashion_hub_app'@'localhost';


CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    images VARCHAR(255),
    categories VARCHAR(25) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

