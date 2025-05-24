import ApprovalRuleByDepartment from "./ApprovalRuleByDepartmentModel.js";
import ApprovalRuleByDesignation from "./ApprovalRuleByDesignationModel.js";
import ApprovalRuleByRequestType from "./ApprovalRuleByRequestTypeModel.js";
import Department from "./DeparmentsModel.js";
import Designation from "./DesignationModel.js";
import Position from "./PositionModel.js";
import Approvers from "./ApproversModel.js";

ApprovalRuleByDepartment.belongsTo(Department, {
  foreignKey: "department_id",
  as: "department",
});

ApprovalRuleByDepartment.belongsTo(Position, {
  foreignKey: "position_id",
  as: "position",
});

ApprovalRuleByDesignation.belongsTo(Designation, {
  foreignKey: "designation_id",
  as: "designation",
});

ApprovalRuleByDesignation.belongsTo(Position, {
  foreignKey: "position_id",
  as: "position",
});

ApprovalRuleByRequestType.belongsTo(Position, {
  foreignKey: "position_id",
  as: "position",
});

Approvers.belongsTo(Position, {
  foreignKey: "position_id",
  as: "position",
});

Approvers.belongsTo(Department, {
  foreignKey: "department_id",
  as: "department",
});

export {
  ApprovalRuleByDepartment,
  ApprovalRuleByDesignation,
  ApprovalRuleByRequestType,
  Approvers,
};
