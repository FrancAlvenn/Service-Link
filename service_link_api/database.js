import { Sequelize } from "sequelize";

let sequelize;

try {
  // Try to connect to MySQL
  sequelize = new Sequelize("service-link", "root", "password", {
    host: "localhost",
    dialect: "mysql",
    port: 3307,
    logging: false,
  });

  await sequelize.authenticate();
  console.log("✅ Connected to the MySQL database via Sequelize!");
} catch (mysqlError) {
  console.error("❌ MySQL connection failed:", mysqlError.message);
  console.log("⚠️ Falling back to SQLite in-memory database...");

  // Fallback to SQLite in-memory database
  sequelize = new Sequelize("sqlite::memory:", {
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log("✅ Connected to SQLite in-memory database.");
  } catch (sqliteError) {
    console.error(
      "❌ Failed to connect to SQLite in-memory DB:",
      sqliteError.message
    );
    process.exit(1); // Exit if both DBs fail
  }
}

export default sequelize;
