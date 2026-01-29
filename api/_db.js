import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = new URL(process.env.DATABASE_URL); 
// DATABASE_URL format: mysql://user:pass@host:port/dbname

const db = mysql.createPool({
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1), // remove leading '/'
  port: Number(dbUrl.port) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: { rejectUnauthorized: false },
});

export default db;
