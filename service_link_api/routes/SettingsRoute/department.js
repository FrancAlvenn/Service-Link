// routes/settings/department.js
import express from "express";
import {
  createNewDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  archiveDepartmentById,
} from "../../controllers/settings_controllers/department.js";

const departmentRouter = express.Router();

// Create a new department
departmentRouter.post("/", createNewDepartment);

// Get all departments
departmentRouter.get("/", getAllDepartments);

// Get department by ID
departmentRouter.get("/:id", getDepartmentById);

// Update department
departmentRouter.put("/:id", updateDepartment);

// Delete department
departmentRouter.delete("/:id/archive/:archive", archiveDepartmentById);

export default departmentRouter;
