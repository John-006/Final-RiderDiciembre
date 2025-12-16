const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config(); 

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',      
    password: '',      
    database: 'supermercado',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    // OBTENER TODOS (READ)
    async getAllData() {
        const response = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM products ORDER BY date_added DESC;";
            connection.query(query, (err, results) => {
                if (err) reject(new Error(err.message));
                resolve(results);
            })
        });
        return response;
    }

    // INSERTAR (CREATE)
    async insertNewName(name, price, stock) {
        const insertId = await new Promise((resolve, reject) => {
            const query = "INSERT INTO products (name, price, stock) VALUES (?, ?, ?);";
            connection.query(query, [name, price, stock], (err, result) => {
                if (err) reject(new Error(err.message));
                resolve(result.insertId);
            })
        });
        return insertId;
    }

    // ELIMINAR (DELETE)
    async deleteRowById(id) {
        const response = await new Promise((resolve, reject) => {
            const query = "DELETE FROM products WHERE id = ?";
            connection.query(query, [id], (err, result) => {
                if (err) reject(new Error(err.message));
                resolve(result.affectedRows);
            })
        });
        return response === 1;
    }

    // ACTUALIZAR (UPDATE)
    async updateNameById(id, name, price, stock) {
        const response = await new Promise((resolve, reject) => {
            const query = "UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?";
            connection.query(query, [name, price, stock, id], (err, result) => {
                if (err) reject(new Error(err.message));
                resolve(result.affectedRows);
            })
        });
        return response === 1;
    }
}

module.exports = DbService;