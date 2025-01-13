import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const PurchasingRequest = sequelize.define("PurchasingRequest", {
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
    date_requested: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    date_required: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    requester: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    supply_category: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    department: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    purpose: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(100),
        defaultValue: "Pending",
    },
    immediate_head_approval: {
        type: DataTypes.STRING(255),
        defaultValue: "Pending",
    },
    gso_director_approval: {
        type: DataTypes.STRING(255),
        defaultValue: "Pending",
    },
    operations_director_approval: {
        type: DataTypes.STRING(255),
        defaultValue: "Pending",
    },
    archived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    remarks: {
        type: DataTypes.TEXT,
        defaultValue: null,
    }
}, {
    modelName: "PurchasingRequest",
    tableName: "purchasing_requests",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

export default PurchasingRequest;
