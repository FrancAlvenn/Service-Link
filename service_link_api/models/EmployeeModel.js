import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const EmployeeModel = sequelize.define(
  "EmployeeModel",
  {
    employee_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reference_number: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      comment: "Unique reference number for employee tracking",
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    middle_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone_number: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    expertise: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment:
        "Specialization or designation (e.g., Driver, Technician, Electrician)",
    },
    hire_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    employment_status: {
      type: DataTypes.STRING(50),
      defaultValue: "Active",
      allowNull: true,
    },
    supervisor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    birth_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    emergency_contact: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    emergency_phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  },
  {
    tableName: "employees",
    timestamps: true,
  }
);

export default EmployeeModel;
