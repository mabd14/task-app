CREATE DATABASE ScholarFlow;
USE ScholarFlow;

-- Users Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE,
    u_password VARCHAR(255)
);

-- Courses Table
CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(255),
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Tasks Table
CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    task_name VARCHAR(255),
    due_date DATETIME,
    duration INT,  -- Duration in minutes
    priority ENUM('low', 'medium', 'high'),
    status ENUM('pending', 'completed', 'overdue') DEFAULT 'pending',
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE c_notes (
    note_id INT AUTO_INCREMENT PRIMARY KEY,
    note_content TEXT,  -- Allowing for very long notes
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

DELIMITER $$

CREATE PROCEDURE GetTasksForUser(IN user_id INT)
BEGIN
    SELECT tasks.*, courses.course_name 
    FROM tasks 
    INNER JOIN courses ON tasks.course_id = courses.course_id 
    WHERE tasks.user_id = user_id;
END $$

DELIMITER ;
