CREATE DATABASE ScholarFlow;
USE ScholarFlow;
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE,
    u_password VARCHAR(255)
);

CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(255)
);

CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    task_name VARCHAR(255),
    due_date DATETIME,
    duration INT,  -- Changed to INT to store duration in minutes
    priority ENUM('low', 'medium', 'high'),
    status ENUM('pending', 'completed', 'overdue') DEFAULT 'pending'
);


ALTER TABLE tasks
ADD COLUMN course_id INT NOT NULL,
ADD FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE;

ALTER TABLE tasks
ADD COLUMN user_id INT NOT NULL,
ADD FOREIGN KEY (user_id) REFERENCES users(user_id);

ALTER TABLE courses
ADD COLUMN user_id INT NOT NULL,
ADD FOREIGN KEY (user_id) REFERENCES users(user_id);


DELIMITER $$

CREATE PROCEDURE GetTasksForUser(IN user_id INT)
BEGIN
    SELECT tasks.*, courses.course_name 
    FROM tasks 
    INNER JOIN courses ON tasks.course_id = courses.course_id 
    WHERE tasks.user_id = user_id;
END $$

DELIMITER ;



-- create stored proc to see what whether it is overdue, pending or complete 
-- create stored proc to show only certain subjects
-- create stored proc to show priority
-- to search for a specific task