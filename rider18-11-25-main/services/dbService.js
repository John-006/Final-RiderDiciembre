const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'supermercado',
  waitForConnections: true,
  connectionLimit: 10
});

class DbService {

  async getAllData() {
    const query = "SELECT * FROM products ORDER BY date_added DESC";
    return new Promise((resolve) => {
      pool.query(query, (err, results) => {
        if (err) {
          console.error("SQL ERROR:", err.message);
          return resolve([]);
        }
        resolve(results);
      });
    });
  }

  async insertNewName(name, price, stock) {
    const query = "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)";
    return new Promise((resolve, reject) => {
      pool.query(query, [name, price, stock], (err, result) => {
        if (err) {
          console.error("SQL ERROR:", err.message);
          return reject(err);
        }
        resolve(result.insertId);
      });
    });
  }

  async deleteRowById(id) {
    const query = "DELETE FROM products WHERE id = ?";
    return new Promise((resolve, reject) => {
      pool.query(query, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows === 1);
      });
    });
  }

  async updateNameById(id, name, price, stock) {
    const query = "UPDATE products SET name=?, price=?, stock=? WHERE id=?";
    return new Promise((resolve, reject) => {
      pool.query(query, [name, price, stock, id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows === 1);
      });
    });
  }
}

module.exports = DbService;
