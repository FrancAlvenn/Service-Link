import express from "express";
import {getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, } from "../controllers/employee.js";

const router = express.Router();

// Employee CRUD Routes
router.get("/", getAllEmployees);

router.get("/:id", getEmployeeById);

router.post("/", createEmployee);

router.put("/:id", updateEmployee);

router.delete("/:id", deleteEmployee);

export default router;
