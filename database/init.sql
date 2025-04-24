-- Création de la base
CREATE DATABASE IF NOT EXISTS dailyflow_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dailyflow_db;

-- Table User (simple)
CREATE TABLE IF NOT EXISTS utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nom VARCHAR(255),
    prenom VARCHAR(255)
);

-- Table Task
CREATE TABLE IF NOT EXISTS task (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    duration INT UNSIGNED NOT NULL CHECK (duration > 0),
    priority INT NOT NULL DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- Table AvailabilitySlot
CREATE TABLE IF NOT EXISTS availability_slot (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- Table EnergyLevel
CREATE TABLE IF NOT EXISTS energy_level (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    period ENUM('morning','afternoon','evening') NOT NULL,
    level INT UNSIGNED NOT NULL DEFAULT 50,
    FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- Table GeneratedSchedule
CREATE TABLE IF NOT EXISTS generated_schedule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_task_user ON task(user_id);
CREATE INDEX idx_avail_user ON availability_slot(user_id);
CREATE INDEX idx_energy_user ON energy_level(user_id);
CREATE INDEX idx_sched_user ON generated_schedule(user_id);
