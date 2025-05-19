import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const VenueRequest = sequelize.define(
  "VenueRequest",
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
    venue_requested: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    requester: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },
    organization: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },
    event_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    event_nature: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    event_dates: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    event_start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    event_end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    participants: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    pax_estimation: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(100),
      defaultValue: "Pending",
    },
    priority: {
      type: DataTypes.STRING(100),
      defaultValue: "Low",
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    immediate_head_approval: {
      type: DataTypes.STRING(255),
      defaultValue: "Pending",
    },
    gso_director_approval: {
      type: DataTypes.STRING(255),
      defaultValue: "Pending",
    },
    operations_director_approval: {
      type: DataTypes.STRING(255),
      defaultValue: "Pending",
    },
    archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
  },
  {
    tableName: "venue_requests",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default VenueRequest;
