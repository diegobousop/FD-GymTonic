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
    role TINYINT NOT NULL
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

