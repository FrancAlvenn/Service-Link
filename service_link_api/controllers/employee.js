import sequelize from "../database.js";
import EmployeeModel from "../models/EmployeeModel.js";
import { createLog } from "./system_logs.js";
import { Op } from "sequelize";

// Generate a unique employee reference number (e.g., EMP-2025-00001)
function generateEmployeeReferenceNumber(lastEmployeeId) {
  const year = new Date().getFullYear();
  const uniqueNumber = String(lastEmployeeId + 1).padStart(5, "0");
  return `EMP-${year}-${uniqueNumber}`;
}

// Create a new Employee
export const createEmployee = async (req, res) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Check if email is unique
    const existingEmployee = await EmployeeModel.findOne({
      where: { email: req.body.email },
    });

    if (existingEmployee) {
      await transaction.rollback();
      return res.status(400).json({ message: "Email must be unique." });
    }

    // Generate a unique reference number
    const lastEmployee = await EmployeeModel.findOne({ order: [["employee_id", "DESC"]] });
    const referenceNumber = generateEmployeeReferenceNumber(
      lastEmployee ? lastEmployee.employee_id : 0
    );

    const hireDate = req.body.hire_date || new Date().toISOString().split("T")[0];

    const newEmployee = await EmployeeModel.create(
      {
        reference_number: referenceNumber,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        middle_name: req.body.middle_name,
        email: req.body.email,
        phone_number: req.body.phone_number,
        position: req.body.position,
        department: req.body.department,
        expertise: req.body.expertise,
        hire_date: hireDate,
        employment_status: req.body.employment_status || "Active",
        supervisor_id: req.body.supervisor_id || null,
        address: req.body.address,
        birth_date: req.body.birth_date,
        emergency_contact: req.body.emergency_contact,
        emergency_phone: req.body.emergency_phone,
        salary: req.body.salary || 0,
      },
      { transaction }
    );

    await transaction.commit();

    createLog({
      action: "create",
      target: referenceNumber,
      performed_by: req.body.user || "system",
      title: "Employee Created",
      details: `Employee with reference number ${referenceNumber} created successfully!`,
    });

    res.status(201).json({ message: "Employee created successfully!", newEmployee });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "Error creating employee", error: error.message });
  }
};

// Get all Employees (excluding Archived)
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await EmployeeModel.findAll({
      where: { employment_status: { [Op.ne]: "Archived" } },
    });

    if (!employees.length) {
      return res.status(404).json({ message: "No employees found." });
    }

    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Error fetching employees", error: error.message });
  }
};

// Get Employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await EmployeeModel.findByPk(req.params.reference_number);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ message: "Error fetching employee", error: error.message });
  }
};

// Update an Employee
export const updateEmployee = async (req, res) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const [updatedRows] = await EmployeeModel.update(req.body, {
      where: { reference_number: req.params.reference_number },
      transaction,
    });

    if (updatedRows === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Employee not found." });
    }

    await transaction.commit();

    createLog({
      action: "update",
      target: req.params.reference_number,
      performed_by: req.body.user || "system",
      title: "Employee Updated",
      details: `Employee with reference number ${req.params.reference_number} updated successfully.`,
    });

    res.status(200).json({ message: "Employee updated successfully!" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Error updating employee", error: error.message });
  }
};

// Archive (Delete) an Employee
export const deleteEmployee = async (req, res) => {
  try {
    const [updatedRows] = await EmployeeModel.update(
      { employment_status: "Archived" },
      { where: { reference_number: req.params.reference_number } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ message: "Employee not found or already archived." });
    }

    createLog({
      action: "archive",
      target: req.params.reference_number,
      performed_by: req.body.user || "system",
      title: "Employee Archived",
      details: `Employee with reference number ${req.params.reference_number} archived successfully.`,
    });

    res.status(200).json({ message: "Employee archived successfully!" });
  } catch (error) {
    console.error("Error archiving employee:", error);
    res.status(500).json({ message: "Error archiving employee", error: error.message });
  }
};

// Get Employees by Status
export const getEmployeesByStatus = async (req, res) => {
  try {
    const employees = await EmployeeModel.findAll({
      where: { employment_status: req.params.status },
    });

    if (!employees.length) {
      return res.status(404).json({
        message: `No employees with status ${req.params.status}`,
      });
    }

    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees by status:", error);
    res.status(500).json({
      message: "Error fetching employees by status",
      error: error.message,
    });
  }
};
