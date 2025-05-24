import { DataTypes } from "sequelize";
import sequelize from "../../database.js";

const ApprovalRuleByDepartment = sequelize.define(
  "ApprovalRuleByDepartment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "departments",
        key: "id",
      },
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
    tableName: "approval_rules_by_department",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ApprovalRuleByDepartment;
