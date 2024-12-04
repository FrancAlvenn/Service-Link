import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const JobRequestDetails = sequelize.define(
  "JobRequestDetails",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    job_request_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "job_requests",
        key: "reference_number",
      },
      onDelete: "CASCADE", // Ensures cascade deletion
    },
    qty: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    particulars: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    archived: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    }
  },
  {
    sequelize,
    modelName: "JobRequestDetails",
    tableName: "job_request_details",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default JobRequestDetails;
