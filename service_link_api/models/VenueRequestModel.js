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
    venue_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    requester: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    organization: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    event_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: false,
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
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(100),
      defaultValue: "Pending",
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
  },
  {
    tableName: "venue_requests",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default VenueRequest;
