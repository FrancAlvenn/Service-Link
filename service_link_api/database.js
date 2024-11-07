import mysql from "mysql2";

export const database = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "service-link",
    port: 3307
})

database.connect((err) => {
    if (err) {
      console.error("Error connecting to the database:", err);
      return;
    }
    console.log("Connected to the MySQL database!");
  });