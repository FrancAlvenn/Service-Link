import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const VenueRequisition = sequelize.define("VenueRequisition", {
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
  venue_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  requester_id: {
    type: DataTypes.INTEGER,
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
  equipment_materials: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(100),
    defaultValue: "pending",
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
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
}, {
  tableName: "venue_requisition",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

export default VenueRequisition;
