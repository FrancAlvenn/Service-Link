import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  ticket_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  reference_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'Approved/InProgress',
  },
  priority_level: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  assigned_to: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  archived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: 'tickets',
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

export default Ticket;
