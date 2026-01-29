// _db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

// Construct MySQL URL
const url = new URL(
  `mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT || 3306}/${DB_NAME}`
);

const db = mysql.createPool({
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.replace("/", ""), // remove leading "/"
  port: Number(url.port),
  waitForConnections: true,
  connectionLimit: 10,
  ssl: { rejectUnauthorized: false }, // optional for cloud MySQL
});

export default db;
