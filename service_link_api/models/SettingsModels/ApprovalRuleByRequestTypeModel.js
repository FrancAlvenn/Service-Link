import { DataTypes } from "sequelize";
import sequelize from "../../database.js";

const ApprovalRuleByRequestType = sequelize.define(
  "ApprovalRuleByRequestType",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    request_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "position",
        key: "id",
      },
    },
    required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    archived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "approval_rules_by_request_type",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ApprovalRuleByRequestType;
