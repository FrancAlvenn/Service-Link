import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const VehicleRequest = sequelize.define("VehicleRequest", {
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
  vehicle_requested: {
    type: DataTypes.STRING(100),
    allowNull: true,
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
    allowNull: false,
  },
  destination: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  purpose: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  requester_id: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  designation: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(100),
    defaultValue: "Pending",
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
  }
}, {
  tableName: "vehicle_requests",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

export default VehicleRequest;
