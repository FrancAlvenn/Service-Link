import { DataTypes } from "sequelize";
import sequelize from "../../database.js";

const UserPreference = sequelize.define('UserPreference', {
    user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    kanban_config: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            columns: [
                { id: 1, name: "Pending"},
                { id: 2, name: "In Progress"},
                { id: 3, name: "Completed"}
            ]
        }
    },
    theme: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "light"
    },
    notifications_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: true
    },
    language: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "en"
    }
}, {
    tableName: 'user_preferences', // Specify the table name
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    underscored: true // Use snake_case for automatically added fields
});

export default UserPreference;