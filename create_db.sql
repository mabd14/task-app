CREATE DATABASE ScholarFlow;
USE ScholarFlow;
CREATE Table users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    username VARCHAR(50),
    email VARCHAR(255),
    u_password VARCHAR(255)
)