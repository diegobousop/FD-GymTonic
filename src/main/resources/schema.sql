
DROP TABLE IF EXISTS Blockuser;
DROP TABLE IF EXISTS Routine_Exercise;
DROP TABLE IF EXISTS Routine_Follow;
DROP TABLE IF EXISTS User_Follow;
DROP TABLE IF EXISTS Serie;
DROP TABLE IF EXISTS Training;
DROP TABLE IF EXISTS Notification;
DROP TABLE IF EXISTS Routine;
DROP TABLE IF EXISTS User_Follow;
DROP TABLE IF EXISTS Notification;
DROP TABLE IF EXISTS Exercise;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Avatar;
DROP TABLE IF EXISTS Images;
DROP TABLE IF EXISTS Icons;

CREATE TABLE Avatar (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) UNIQUE NOT NULL,
    avatarBase64 MEDIUMTEXT NOT NULL
);


CREATE TABLE Users (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(60) NOT NULL,
    password VARCHAR(60) NOT NULL, 
    firstName VARCHAR(60) NOT NULL,
    lastName VARCHAR(60) NOT NULL, 
    email VARCHAR(60) NOT NULL,
    avatar BIGINT,
    role TINYINT NOT NULL, /*0 User, 1 Trainer. 2 Admin*/
    premium BOOLEAN DEFAULT FALSE,
    banned BOOLEAN NOT NULL DEFAULT FALSE,
    bankCard VARCHAR(16),
    FOREIGN KEY (avatar) REFERENCES Avatar(id)
);
CREATE TABLE Blockuser (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idBlocker BIGINT NOT NULL,
    idBlocked BIGINT NOT NULL,
    dateBlock TIMESTAMP,
    FOREIGN KEY (idBlocker) REFERENCES Users(id),
    FOREIGN KEY (idBlocked) REFERENCES Users(id)
);

CREATE TABLE Exercise (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    exerciseName VARCHAR(60) NOT NULL,
    exerciseDescription VARCHAR(255) NOT NULL,
    grupoMuscular VARCHAR(20) NOT NULL,
    numeroSeries INT NOT NULL,
    creator BIGINT,
    validated BOOLEAN NOT NULL DEFAULT FALSE,
    validator BIGINT,
    difficulty TINYINT NOT NULL DEFAULT 0, /*0 Easy, 1 Medium, 2 Hard*/
    equipment TINYINT NOT NULL DEFAULT 3, /*0 Polea/cable, 1 Maquina, 2 Peso_Libre, 3 Otros*/
    iconId BIGINT,
    FOREIGN KEY (creator) REFERENCES Users(id),
    FOREIGN KEY (validator) REFERENCES Users(id)
);



CREATE TABLE Routine (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    creator BIGINT, 
    duration BIGINT,
    modificationDate TIMESTAMP,
    difficulty TINYINT DEFAULT 0,
    isPublic BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (creator) REFERENCES Users(id)
);

CREATE TABLE Routine_Exercise (
    routine_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    PRIMARY KEY (routine_id, exercise_id),
    FOREIGN KEY (routine_id) REFERENCES Routine(id),
    FOREIGN KEY (exercise_id) REFERENCES Exercise(id)
);

CREATE TABLE Routine_Follow (
    user_id BIGINT NOT NULL,
    routine_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, routine_id),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (routine_id) REFERENCES Routine(id)
);

CREATE TABLE Training (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    description VARCHAR(255),
    creationDate TIMESTAMP NOT NULL,
    isPublic BOOLEAN DEFAULT TRUE,
    userId BIGINT NOT NULL,
    routineId BIGINT,
    FOREIGN KEY (userId) REFERENCES Users(id)
);

CREATE TABLE Serie (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    repeticiones INT NOT NULL,
    peso INT NOT NULL,
    numeroSerie INT NOT NULL,
    exerciseId BIGINT NOT NULL,
    routineId BIGINT,
    trainingId BIGINT,
    FOREIGN KEY (exerciseId) REFERENCES Exercise(id),
    FOREIGN KEY (routineId) REFERENCES  Routine(id),
    FOREIGN KEY (trainingId) REFERENCES Training(id)
);



CREATE TABLE Images(
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) UNIQUE NOT NULL,
    source MEDIUMTEXT NOT NULL
);

CREATE TABLE Icons(
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) UNIQUE NOT NULL,
    iconBase64 MEDIUMTEXT NOT NULL
);

CREATE TABLE User_Follow(
    follower_id BIGINT NOT NULL,
    followed_id BIGINT NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followed_id),
    FOREIGN KEY (follower_id) REFERENCES Users(id),
    FOREIGN KEY (followed_id) REFERENCES Users(id)
);

CREATE TABLE Notification (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    receiverId BIGINT NOT NULL,
    senderId BIGINT,
    routineId BIGINT,
    message VARCHAR(255) NOT NULL,
    isRead BOOLEAN NOT NULL DEFAULT FALSE,
    date TIMESTAMP NOT NULL,
    FOREIGN KEY (receiverId) REFERENCES Users(id),
    FOREIGN KEY (senderId) REFERENCES Users(id),
    FOREIGN KEY (routineId) REFERENCES Routine(id)
);

