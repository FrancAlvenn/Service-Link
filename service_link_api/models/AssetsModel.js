import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const AssetModel = sequelize.define(
  "AssetModel",
  {
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
      defaultValue: "Available",
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

    // Additional Details for specific assets - e.g., capacity, manufacturer, model, serial number, etc.
    additional_details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "assets",
    timestamps: true,
  }
);

export default AssetModel;
