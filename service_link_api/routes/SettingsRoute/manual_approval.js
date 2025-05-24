// routes/settings/department.js
import express from "express";
import {
  createNewManualApprovalRule,
  getAllManualApprovalRules,
  getManualApprovalRuleById,
  updateManualApprovalRule,
  archiveManualApprovalRuleById,
  deleteManualApprovalRuleById,
} from "../../controllers/settings_controllers/manual_approval_rules.js";

const approvalRulesRouter = express.Router();

// Create a new department
approvalRulesRouter.post("/", createNewManualApprovalRule);

// Get all departments
approvalRulesRouter.get("/", getAllManualApprovalRules);

// Get department by ID
approvalRulesRouter.get("/:id", getManualApprovalRuleById);

// Update department
approvalRulesRouter.put("/:id", updateManualApprovalRule);

// Delete department
approvalRulesRouter.delete("/:id", deleteManualApprovalRuleById);

// Archive department
approvalRulesRouter.delete(
  "/:id/archive/:archive",
  archiveManualApprovalRuleById
);

export default approvalRulesRouter;
