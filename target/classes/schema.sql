DROP TABLE IF EXISTS Routine_Exercise;
DROP TABLE IF EXISTS Routine;
DROP TABLE IF EXISTS Exercise;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(60) NOT NULL,
    password VARCHAR(60) NOT NULL, 
    firstName VARCHAR(60) NOT NULL,
    lastName VARCHAR(60) NOT NULL, 
    email VARCHAR(60) NOT NULL,
    role TINYINT NOT NULL /*0 User, 1 Trainer. 2 Admin*/
);

CREATE TABLE Exercise (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    exerciseName VARCHAR(60) NOT NULL,
    exerciseDescription VARCHAR(255) NOT NULL,
    grupoMuscular VARCHAR(20) NOT NULL
);

CREATE TABLE Routine (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    creator BIGINT, 
    duration BIGINT,
    modificationDate TIMESTAMP,
    FOREIGN KEY (creator) REFERENCES Users(id)
);

CREATE TABLE Routine_Exercise (
    routine_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    PRIMARY KEY (routine_id, exercise_id),
    FOREIGN KEY (routine_id) REFERENCES Routine(id),
    FOREIGN KEY (exercise_id) REFERENCES Exercise(id)
);

-- SOME DATA FOR TESTING PURPOSES

INSERT INTO Users (userName, password, firstName, lastName, email, role) VALUES
('admin1', '$2a$12$5Ijjc/.vyF9P2Hmxw7QbEuHNtbCYkWD8S2wZ0SgbrErvmY3DeIMC6', 'Admin', 'User', 'admin1@admin.com', 2), -- password 12345
('trainer1', '$2a$12$5Ijjc/.vyF9P2Hmxw7QbEuHNtbCYkWD8S2wZ0SgbrErvmY3DeIMC6', 'Trainer', 'User', 'trainer1@trainer.com',1 ),
('user1', '$2a$12$5Ijjc/.vyF9P2Hmxw7QbEuHNtbCYkWD8S2wZ0SgbrErvmY3DeIMC6', 'User', 'User', 'User1@user.com', 0);

INSERT INTO Exercise (exerciseName, exerciseDescription, grupoMuscular) VALUES
('Push Up', 'A bodyweight exercise that primarily targets the chest, shoulders, and triceps.', 'PECHO'),
('Squat', 'A lower body exercise that primarily targets the quadriceps, hamstrings, and glutes.', 'PIERNA'),
('Pull Up', 'An upper body exercise that primarily targets the back and biceps.', 'ESPALDA'),
('Lunge', 'A lower body exercise that targets the quadriceps, hamstrings, and glutes.', 'PIERNA'),
('Shoulder Press', 'An upper body exercise that targets the shoulders and triceps.', 'HOMBROS');