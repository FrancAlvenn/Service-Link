import { DataTypes } from "sequelize";
import sequelize from "../../database.js";

const Department = sequelize.define('Department', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
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
    tableName: 'departments',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

export default Department;