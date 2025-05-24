import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const JobRequest = sequelize.define(
  "JobRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reference_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    date_required: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.STRING(255),
      defaultValue: "pending",
    },
    priority: {
      type: DataTypes.STRING(100),
      defaultValue: "Low",
      allowNull: true,
    },
    requester: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: "users",
        key: "reference_number",
      },
    },
    immediate_head_approval: {
      type: DataTypes.STRING(255),
      defaultValue: "pending",
    },
    gso_director_approval: {
      type: DataTypes.STRING(255),
      defaultValue: "pending",
    },
    operations_director_approval: {
      type: DataTypes.STRING(255),
      defaultValue: "pending",
    },
    archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    authorized_access: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    assigned_to: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of assigned employee reference numbers or full objects",
    },
    assigned_assets: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of assigned asset reference numbers or full objects",
    },
    approvers: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of approvers reference numbers or full objects",
    },
  },
  {
    sequelize,
    modelName: "JobRequest",
    tableName: "job_requests",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default JobRequest;
