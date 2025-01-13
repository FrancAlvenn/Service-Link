import { DataTypes } from "sequelize";
import sequelize from "../../database.js";

const Status = sequelize.define('Status', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    status: {
        type : DataTypes.STRING,
        allowNull: false,
    },
    color: {
        type : DataTypes.STRING,
        allowNull: true,
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
    tableName: 'status',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

export default Status;