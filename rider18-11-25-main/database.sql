-- Script para crear la base de datos y tabla de productos
CREATE DATABASE IF NOT EXISTS `db-Jhon`;
USE `db-Jhon`;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos de ejemplo
INSERT INTO products (nombre, precio, stock) VALUES
('Producto 1', 19.99, 100),
('Producto 2', 29.99, 50),
('Producto 3', 9.99, 200);
    