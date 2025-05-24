import sequelize from "../../database.js";
import DesignationModel from "../../models/SettingsModels/DesignationModel.js";
import { Op } from "sequelize";

export async function createNewDesignation(req, res) {
  try {
    const newDesignation = await DesignationModel.create({
      designation: req.body.designation,
      description: req.body.description,
    });

    res.status(201).json({ message: `Designation added successfully!` });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function getAllDesignation(req, res) {
  try {
    const designations = await DesignationModel.findAll({
      where: {
        archived: {
          [Op.eq]: false, // Get all that is not archived
        },
      },
    });
    res.status(201).json({
      designations,
      message: `Designation data fetched successfully!`,
    });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function getDesignationById(req, res) {
  try {
    const designation = await DesignationModel.findAll({
      where: {
        id: req.params.id,
      },
      archived: {
        [Op.eq]: false, // Get all that is not archived
      },
    });
    res
      .status(201)
      .json({ designation, message: `Designation data fetched successfully!` });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function updateDesignation(req, res) {
  try {
    const [updatedRows] = await DesignationModel.update(
      {
        designation: req.body.designation,
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
        message: `No  n found with the reference number: ${req.params.id}`,
      });
    }

    res.status(200).json({ message: `Request updated successfully!` });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function deleteDesignationById(req, res) {
  try {
    const deletedRows = await DesignationModel.destroy({
      where: {
        id: req.params.id,
      },
    });

    // If no rows were deleted, it means the reference number didn't match any requisition
    if (deletedRows === 0) {
      return res.status(404).json({
        message: `No designation found with reference number ${req.params.id}`,
      });
    }

    res.status(200).json({
      message: "Designation deleted from database!",
    });
  } catch (error) {
    res.status(500).json({
      message: `Encountered an internal error ${error}`,
      error: error,
    });
  }
}

export async function archiveDesignationById(req, res) {
  try {
    const [updatedRows] = await DesignationModel.update(
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
