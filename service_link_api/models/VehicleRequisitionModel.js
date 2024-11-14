import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const VehicleRequisition = sequelize.define("VehicleRequisition", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  reference_number: {  // Changed to match the SQL column name
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  vehicle_requested: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  date_filled: {  // Changed to match the SQL column name
    type: DataTypes.DATE,
    allowNull: false,
  },
  date_of_trip: {  // Changed to match the SQL column name
    type: DataTypes.DATE,
    allowNull: false,
  },
  time_of_departure: {  // Changed to match the SQL column name
    type: DataTypes.TIME,
    allowNull: false,
  },
  time_of_arrival: {  // Changed to match the SQL column name
    type: DataTypes.TIME,
    allowNull: true,
  },
  number_of_passengers: {  // Changed to match the SQL column name
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  destination: {
    type: DataTypes.STRING(255),  // Changed to match the SQL column name and length
    allowNull: false,
  },
  purpose: {  // Changed to match the SQL column name
    type: DataTypes.TEXT,
    allowNull: false,
  },
  requestor: {  // Changed to match the SQL column name
    type: DataTypes.STRING(100),  // Adjusted size to match the SQL column length
    allowNull: false,
  },
  designation: {  // Changed to match the SQL column name
    type: DataTypes.STRING(100),  // Adjusted size to match the SQL column length
    allowNull: true,
  },
  status: {  // Changed to match the SQL column name
    type: DataTypes.STRING(100),
    defaultValue: "Pending",
  },
  vehicle_id: {  // Changed to match the SQL column name
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  immediate_head_approval: {  // Changed to match the SQL column name
    type: DataTypes.ENUM("Pending", "Approved", "Denied"),
    defaultValue: "Pending",
  },
  gso_director_approval: {  // Changed to match the SQL column name
    type: DataTypes.ENUM("Pending", "Approved", "Denied"),
    defaultValue: "Pending",
  },
  operations_director_approval: {  // Changed to match the SQL column name
    type: DataTypes.ENUM("Pending", "Approved", "Denied"),
    defaultValue: "Pending",
  },
  archived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: "vehicle_requisition",  // Matches the table name in the SQL schema
  timestamps: true,  // Enables Sequelize's automatic handling of createdAt/updatedAt fields
  createdAt: "created_at",
  updatedAt: "updated_at",
});

export default VehicleRequisition;
