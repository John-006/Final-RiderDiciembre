const mysql = require("mysql2/promise");

async function dbInit() {
  try {
    const conn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: ""
    });

    await conn.query("CREATE DATABASE IF NOT EXISTS supermercado");
    await conn.query("USE supermercado");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL,
        date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.end();
    console.log("BD lista, y tabla 'products' creada... por favor dirigase a localhost:3000 para acceder a la tabla.");
  } catch (err) {
    console.error("❌ Error en dbInit:", err.message);
    throw err; // ⬅️ IMPORTANTE
  }
}

module.exports = dbInit;
