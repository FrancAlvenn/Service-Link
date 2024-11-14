import { Sequelize } from "sequelize";

// Initialize Sequelize with database connection settings
const sequelize = new Sequelize("service-link", "root", "password", {
  host: "localhost",
  dialect: "mysql",
  port: 3307,
  logging: false,
});

// Test the connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to the MySQL database via Sequelize!");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

export default sequelize;
