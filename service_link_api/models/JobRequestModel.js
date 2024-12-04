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
    date_required: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    purpose: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    requester_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    immediate_head_approval: {
        type: DataTypes.STRING(255),
        defaultValue: 'pending',
    },
    gso_director_approval: {
        type: DataTypes.STRING(255),
        defaultValue: 'pending',
    },
    operations_director_approval: {
        type: DataTypes.STRING(255),
        defaultValue: 'pending',
    },
    archived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
