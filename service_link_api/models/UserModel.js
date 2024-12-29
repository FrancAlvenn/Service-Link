// models/User.js
import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    reference_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    google_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    contact_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    profile_image_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    organization: {
        type: DataTypes.STRING,
        allowNull: true
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true
    },
    designation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    access_level: {
        type: DataTypes.STRING,
        allowNull: true
    },
    immediate_head: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    archived:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'users',
    timestamps: true,  // Automatically adds `createdAt` and `updatedAt`
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default User;
