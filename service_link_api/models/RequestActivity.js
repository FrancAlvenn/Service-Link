import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const RequestActivityModel = sequelize.define(
  "RequestActivity",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    request_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    visibility: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    viewed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    request_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "RequestActivity",
    tableName: "request_activities",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default RequestActivityModel;
