import { DataTypes } from "sequelize";
import sequelize from "../database.js";
import AssetModel from "./AssetsModel.js";

const AssetAssignmentLogModel = sequelize.define(
  "AssetAssignmentLog",
  {
    log_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    asset_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: AssetModel,
        key: "asset_id",
      },
      onDelete: "CASCADE",
    },
    assigned_to: {
      type: DataTypes.STRING(255), // could be an employee name, department, or user_id
      allowNull: false,
    },
    assigned_by: {
      type: DataTypes.STRING(255), // admin who made the assignment
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    assignment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    return_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "asset_assignment_logs",
    timestamps: true,
  }
);

export default AssetAssignmentLogModel;
