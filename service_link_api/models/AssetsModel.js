import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const Asset = sequelize.define("Asset", {
  asset_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  reference_number: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  asset_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  manufacturer: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  model: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  serial_number: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: true,
  },
  purchase_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  purchase_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'Available',
    allowNull: true,
  },
  last_maintenance: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  warranty_expiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  type_specific_1: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  type_specific_2: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  type_specific_3: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'assets',
  timestamps: false, // Set to true if you have created_at/updated_at fields
});

export default Asset;
