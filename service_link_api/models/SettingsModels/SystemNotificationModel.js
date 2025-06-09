import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const SystemNotificationModel = sequelize.define(
  "SystemNotification",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    recipient_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Null for broadcast notifications",
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "system",
      validate: {
        isIn: [["system", "alert", "update", "event", "reminder", "security"]],
      },
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "e.g., 'password_reset', 'new_feature', 'maintenance'",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "critical"),
      allowNull: false,
      defaultValue: "medium",
    },
    isViewed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    action: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "e.g., {text: 'View', url: '/settings', method: 'GET'}",
    },
    // Additional metadata
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Additional structured data",
    },
    // Related entity
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "e.g., 'user', 'request', 'ticket'",
    },
    entity_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ID of related entity",
    },
    // Source of notification
    source: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "system",
      comment: "e.g., 'security_system', 'support_team', 'billing'",
    },
  },
  {
    sequelize,
    modelName: "SystemNotification",
    tableName: "system_notifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      // Indexes for common query patterns
      {
        fields: ["recipient_id", "isViewed"],
      },
      {
        fields: ["category"],
      },
    ],
  }
);

export default SystemNotificationModel;
