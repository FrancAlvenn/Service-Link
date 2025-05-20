import sequelize from "../../database.js";
import DepartmentsModel from "../../models/SettingsModels/DeparmentsModel.js";
import { Op } from "sequelize";

export async function createNewDepartment(req, res) {
  try {
    const newDepartment = await DepartmentsModel.create({
      name: req.body.name,
      description: req.body.description,
    });

    res.status(201).json({ message: `Department added successfully!` });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function getAllDepartments(req, res) {
  try {
    const departments = await DepartmentsModel.findAll({
      where: {
        archived: {
          [Op.eq]: false, // Get all that is not archived
        },
      },
    });
    res
      .status(201)
      .json({ departments, message: `Department data fetched successfully!` });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function getDepartmentById(req, res) {
  try {
    const departments = await DepartmentsModel.findAll({
      where: {
        id: req.params.id,
      },
      archived: {
        [Op.eq]: false, // Get all that is not archived
      },
    });
    res
      .status(201)
      .json({ departments, message: `Department data fetched successfully!` });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function updateDepartment(req, res) {
  try {
    const [updatedRows] = await DepartmentsModel.update(
      {
        name: req.body.name,
        description: req.body.description,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    // If no rows were updated, it means the reference number didn't match any requisition
    if (updatedRows === 0) {
      return res.status(404).json({
        message: `No department found with the reference number: ${req.params.id}`,
      });
    }

    res.status(200).json({ message: `Request updated successfully!` });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function archiveDepartmentById(req, res) {
  try {
    const [updatedRows] = await DepartmentsModel.update(
      {
        archived: req.params.archive,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    // If no rows were updated, it means the reference number didn't match any requisition
    if (updatedRows === 0) {
      return res.status(404).json({
        message: `No requisition found with reference number ${req.params.id}`,
      });
    }

    res.status(200).json({
      message:
        req.params.archive === "0"
          ? "Request removed from archive!"
          : "Request added to archive!",
    });
  } catch (error) {
    res.status(500).json({
      message: `Encountered an internal error ${error}`,
      error: error,
    });
  }
}
