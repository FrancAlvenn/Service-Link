// routes/settings/department.js
import express from "express";
import {
  createNewApprovalRule,
  getAllApprovalRules,
  getApprovalRuleById,
  updateApprovalRule,
  archiveApprovalRuleById,
  deleteApprovalRuleById,
} from "../../controllers/settings_controllers/approval_rules.js";

const approvalRulesRouter = express.Router();

// Create a new department
approvalRulesRouter.post("/", createNewApprovalRule);

// Get all departments
approvalRulesRouter.get("/", getAllApprovalRules);

// Get department by ID
approvalRulesRouter.get("/:id", getApprovalRuleById);

// Update department
approvalRulesRouter.put("/:id", updateApprovalRule);

// Delete department
approvalRulesRouter.delete("/:id", deleteApprovalRuleById);

// Archive department
approvalRulesRouter.delete("/:id/archive/:archive", archiveApprovalRuleById);

export default approvalRulesRouter;
