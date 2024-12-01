import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const Logs = sequelize.define("Logs", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  reference_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  performed_by: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  target: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  archived: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: "system_logs",
  timestamps: true,  // Automatically adds `createdAt` and `updatedAt`
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Logs;
