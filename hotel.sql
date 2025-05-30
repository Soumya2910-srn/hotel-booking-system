CREATE DATABASE IF NOT EXISTS Hotel_db;
USE Hotel_db;

CREATE DATABASE IF NOT EXISTS login_db;
USE login_db;


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    userType ENUM('User', 'Admin') NOT NULL
);

-- Insert default users (hashed passwords)
INSERT INTO users (userId, password, name, userType) 
VALUES 
('123', '$2b$10$VqWJ1zU7vFjhLKU8eMeUHe.Z7aJcABzUOa/QTHZ/TFgS3wXSCegBC', 'Default User', 'User'),
('143', '$2b$10$eIMocqzEzGpI7P9Bts/WRuVpJZJmeGADsT5uBZ.6e5OUWpxZbJ1C2', 'Default Admin', 'Admin');

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    userType ENUM('User', 'Admin') NOT NULL
);

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    user_id VARCHAR(50) NOT NULL, 
    name VARCHAR(100) NOT NULL, 
    phone VARCHAR(20) NOT NULL, 
    email VARCHAR(100) NOT NULL, 
    room_type VARCHAR(50) NOT NULL, 
    price DECIMAL(10,2) NOT NULL,
    booking_date DATE NOT NULL,
    payment_type VARCHAR(50) NOT NULL, 
    transaction_id VARCHAR(50) UNIQUE NOT NULL, 
    receipt VARCHAR(255) NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM bookings;
drop table bookings;

CREATE TABLE food_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255),
    room_number INT,
    item_name VARCHAR(255),
    price DECIMAL(10,2),
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


SELECT * FROM food_orders;
DROP TABLE food_orders;

SELECT * FROM users WHERE userId = 'your_test_user_id';
DELETE FROM users WHERE userId = 'your_test_user_id';



USE login_db;
DESC users;

ALTER TABLE users ADD COLUMN userType ENUM('User', 'Admin') NOT NULL DEFAULT 'User';



select * from users;