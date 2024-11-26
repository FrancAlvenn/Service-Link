import { DataTypes } from "sequelize";
import sequelize from "../../database.js";

const Priority = sequelize.define('Priority', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    priority: {
        type : DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
},{
    tableName: 'priority_level',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

export default Priority;