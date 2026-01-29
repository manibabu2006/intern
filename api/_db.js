// _db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); // ensure env variables are loaded

// Create MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: { rejectUnauthorized: false }, // required if your DB needs SSL
});

export default db;
