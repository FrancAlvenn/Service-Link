import express from "express";
import {
  createNewDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  archiveDepartmentById,
  deleteDepartmentById,
} from "../controllers/settings_controllers/department.js";
import {
  createNewOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  archiveOrganizationById,
  deleteOrganizationById,
} from "../controllers/settings_controllers/organization.js";
import {
  createNewStatus,
  getAllStatus,
  getStatusById,
  updateStatus,
  deleteStatusById,
} from "../controllers/settings_controllers/status.js";
import {
  createNewPriority,
  getAllPriority,
  getPriorityById,
  updatePriority,
  archivePriorityById,
  deletePriorityById,
} from "../controllers/settings_controllers/priority_level.js";
import {
  createNewDesignation,
  getAllDesignation,
  getDesignationById,
  updateDesignation,
  archiveDesignationById,
  deleteDesignationById,
} from "../controllers/settings_controllers/designation.js";
import {
  createUserPreference,
  deleteUserPreference,
  getUserPreference,
  updateUserPreference,
} from "../controllers/settings_controllers/user_preference.js";
import {
  createNewApprover,
  getAllApprovers,
  getApproversById,
  updateApproversById,
  archiveApproversById,
  deleteApproversById,
} from "../controllers/settings_controllers/approvers.js";
import {
  createNewPosition,
  getAllPositions,
  getPositionById,
  updatePosition,
  archivePositionById,
  deletePositionById,
} from "../controllers/settings_controllers/position.js";

const router = express.Router();

//ROUTE FOR DEPARTMENTS

//Create a new department
router.post("/department", createNewDepartment);

//Get all departments
router.get("/department", getAllDepartments);

//Get departments by ID
router.get("/department/:id", getDepartmentById);

//Edit a department
router.put("/department/:id", updateDepartment);

//Delete a department
router.delete("/department/:id", deleteDepartmentById);

//Archive a department
router.delete("/department/:id/archive/:archive", archiveDepartmentById);

//ROUTE FOR ORGANIZATIONS

//Create a new organization
router.post("/organization", createNewOrganization);

//Get all organizations
router.get("/organization", getAllOrganizations);

//Get organizations by ID
router.get("/organization/:id", getOrganizationById);

//Edit a organization
router.put("/organization/:id", updateOrganization);

//Delete a organization
router.delete("/organization/:id", deleteOrganizationById);

//Archive a organization
router.delete("/organization/:id/archive/:archive", archiveOrganizationById);

//ROUTE FOR STATUS

//Create a new status
router.post("/status", createNewStatus);

//Get all status
router.get("/status", getAllStatus);

//Get status by ID
router.get("/status/:id", getStatusById);

//Edit a status
router.put("/status/:id", updateStatus);

//Delete a status
router.delete("/status/:id", deleteStatusById);

//ROUTE FOR PRIORITY

//Create a new priority
router.post("/priority", createNewPriority);

//Get all priority
router.get("/priority", getAllPriority);

//Get priority by ID
router.get("/priority/:id", getPriorityById);

//Edit a priority
router.put("/priority/:id", updatePriority);
router.delete("");
//Delete a priority
router.delete("/priority/:id", deletePriorityById);

//Archive a priority
router.delete("/priority/:id/archive/:archive", archivePriorityById);

//ROUTE FOR DESIGNATION

//Create a new designation
router.post("/designation", createNewDesignation);

//Get all designation
router.get("/designation", getAllDesignation);

//Get designation by ID
router.get("/designation/:id", getDesignationById);

//Edit a designation
router.put("/designation/:id", updateDesignation);

//Delete a designation
router.delete("/designation/:id", deleteDesignationById);

//Archive a designation
router.delete("/designation/:id/archive/:archive", archiveDesignationById);

//ROUTE FOR USER PREFERENCES

//Create a new user preference
router.post("/user_preference", createUserPreference);

//Get user preference by user_id
router.get("/user_preference/:user_id", getUserPreference);

//Update user preference by user_id
router.put("/user_preference/:user_id", updateUserPreference);

//Delete user preference by user_id
router.delete("/user_preference/:user_id", deleteUserPreference);

// ROUTE FOR APPROVER

//Create a new approver
router.post("/approver", createNewApprover);

//Get all approver
router.get("/approver", getAllApprovers);

//Get approver by ID
router.get("/approver/:id", getApproversById);

//Edit a approver
router.put("/approver/:id", updateApproversById);

//Delete a approver
router.delete("/approver/:id", deleteApproversById);

//Archive a approver
router.delete("/approver/:id/archive/:archive", archiveApproversById);

//ROUTE FOR POSITION

//Create a new position
router.post("/position", createNewPosition);

//Get all position
router.get("/position", getAllPositions);

//Get position by ID
router.get("/position/:id", getPositionById);

//Edit a position
router.put("/position/:id", updatePosition);

//Delete a position
router.delete("/position/:id", deletePositionById);

//Archive a position
router.delete("/position/:id/archive/:archive", archivePositionById);

export default router;
