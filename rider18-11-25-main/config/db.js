import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'Bd_mysql_Rider',
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    timezone: 'local',
    charset: 'utf8mb4',
    decimalNumbers: true,
    connectionLimit: 20,
    queueLimit: 100,
    idleTimeout: 30000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
};

console.log('Configuracion de MySQL', poolConfig);

export const pool = createPool(poolConfig);

pool.getConnection()
    .then(connection => {
        console.log('Conectado a MySQL, base de dato actual:', connection.config.database);
        connection.release();
    })
    .catch(err => {
        console.error('Error de conexion a MySQL', err.message);
        process.exit(1);
    });

pool.query('SELECT DATABASE() AS db')
    .then(([rows]) => {
        console.log('Conectado a la base de datos', rows[0].db);
    })
    .catch(err => {
        console.error('Error al conectar a la base de datos', err.message);
        process.exit(1);
    });