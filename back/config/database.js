const mysql = require("mysql2");
const dotenv = require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

db.connect(function (err) {
  if (err) throw err;
  console.log("Database Connected");
});

module.exports = db;
