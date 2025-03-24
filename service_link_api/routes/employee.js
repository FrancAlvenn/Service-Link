import express from "express";
import {getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, } from "../controllers/employee.js";

const router = express.Router();

// Employee CRUD Routes
router.get("/", getAllEmployees);

router.get("/:reference_number", getEmployeeById);

router.post("/", createEmployee);

router.put("/:reference_number", updateEmployee);

router.delete("/:reference_number", deleteEmployee);

export default router;
