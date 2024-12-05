import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const PurchasingRequestDetails = sequelize.define("PurchasingRequestDetails", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    purchasing_request_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: "purchasing_requests",
            key: "reference_number",
          },
          onDelete: "CASCADE",
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    particulars: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
}, {
    modelName: "PurchasingRequestDetails",
    tableName: "purchasing_request_details",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

export default PurchasingRequestDetails;