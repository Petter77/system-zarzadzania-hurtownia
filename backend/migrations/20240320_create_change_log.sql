CREATE TABLE IF NOT EXISTS change_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    data_id INT NOT NULL,
    operation_type ENUM('create', 'update', 'delete') NOT NULL,
    previous_data JSON,
    new_data JSON,
    FOREIGN KEY (user_id) REFERENCES users(id)
); 