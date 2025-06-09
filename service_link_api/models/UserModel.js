// models/User.js
import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    reference_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    google_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    contact_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profile_image_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    organization_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "organizations",
        key: "id",
      },
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "departments",
        key: "id",
      },
    },
    designation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "designation",
        key: "id",
      },
    },
    access_level: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    immediate_head: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "users",
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User;
