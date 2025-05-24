import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const VehicleRequest = sequelize.define(
  "VehicleRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    vehicle_requested: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },
    date_filled: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    date_of_trip: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    time_of_departure: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    time_of_arrival: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    number_of_passengers: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    destination: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    requester: {
      type: DataTypes.STRING(100),
      allowNull: false,
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
    vehicle_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    immediate_head_approval: {
      type: DataTypes.ENUM("Pending", "Approved", "Denied"),
      defaultValue: "Pending",
    },
    gso_director_approval: {
      type: DataTypes.ENUM("Pending", "Approved", "Denied"),
      defaultValue: "Pending",
    },
    operations_director_approval: {
      type: DataTypes.ENUM("Pending", "Approved", "Denied"),
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
    approvers: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of approvers reference numbers or full objects",
    },
  },
  {
    tableName: "vehicle_requests",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default VehicleRequest;
