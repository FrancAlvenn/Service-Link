import { DataTypes } from "sequelize";
import sequelize from "../../database.js";

const Designation = sequelize.define('Designation', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    designation: {
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
    tableName: 'designation',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

export default Designation;