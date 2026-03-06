
CREATE DATABASE erp_system;
USE erp_system;

-- 1. Users Table (Module 6: Auth)
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Sales', 'Warehouse', 'Manager') DEFAULT 'Admin',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Platforms Table (Module 1 & 9)
CREATE TABLE Platforms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- e.g., Amazon, Flipkart
    api_key VARCHAR(255),
    status ENUM('Active', 'Inactive') DEFAULT 'Active'
);

-- 3. Products Table (Module 3: Inventory)
CREATE TABLE Products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    total_stock INT DEFAULT 0,
    price DECIMAL(10, 2)
);

-- 4. Orders Table (Module 2: Order Management)
CREATE TABLE Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    platform_id INT,
    external_order_id VARCHAR(100), -- ID from Amazon/Flipkart
    customer_name VARCHAR(255),
    total_amount DECIMAL(10, 2),
    order_status ENUM('Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Placed',
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (platform_id) REFERENCES Platforms(id)
);



-- Insert some dummy data
INSERT INTO Platforms (name) VALUES ('Amazon'), ('Flipkart'), ('JioMart');
INSERT INTO Products (sku, name, total_stock, price) VALUES ('TSHIRT-001', 'Cotton T-Shirt Blue', 100, 499.00);

USE erp_system;


	ALTER TABLE Users ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

	-- Add timestamps to Orders
	ALTER TABLE Orders ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
	ALTER TABLE Orders ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

	-- Add timestamps to Products
	ALTER TABLE Products ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
	ALTER TABLE Products ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    
USE erp_system;

-- 1. Suppliers Table (Gap 3)
CREATE TABLE Suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    category VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Audit Logs Table (Gap 5)
CREATE TABLE AuditLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255), -- e.g., "Updated Stock for SKU-001"
    module VARCHAR(50), -- e.g., "Inventory"
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- 3. Notifications Upgrade (Gap 4)
CREATE TABLE Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT,
    severity ENUM('Info', 'Warning', 'Critical') DEFAULT 'Info',
    is_read BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

USE erp_system;

-- Add threshold and category to Products (Gap 1)
ALTER TABLE Products ADD COLUMN low_stock_threshold INT DEFAULT 10;
ALTER TABLE Products ADD COLUMN category VARCHAR(50);

-- Create Stock Adjustments table to track manual changes (Gap 1 & 5)
CREATE TABLE StockAdjustments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    user_id INT,
    adjustment_amount INT, -- e.g., -5 for damaged, +20 for new arrival
    reason ENUM('Restock', 'Damaged', 'Return', 'Correction') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
select * from users;
SELECT SUM(total_amount) FROM Orders;
select * from orders;