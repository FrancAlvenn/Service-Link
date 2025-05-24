import sequelize from "../../database.js";
import PositionModel from "../../models/SettingsModels/PositionModel.js";
import { Op } from "sequelize";

export async function createNewPosition(req, res) {
  try {
    const newPosition = await PositionModel.create({
      position: req.body.position,
      description: req.body.description,
      approval_level: req.body.approval_level,
    });

    res.status(201).json({ message: `Position added successfully!` });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function getAllPositions(req, res) {
  try {
    const positions = await PositionModel.findAll({
      where: {
        archived: {
          [Op.eq]: false, // Get all that is not archived
        },
      },
    });
    res.status(201).json({
      positions,
      message: `Position data fetched successfully!`,
    });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function getPositionById(req, res) {
  try {
    const position = await PositionModel.findAll({
      where: {
        id: req.params.id,
      },
      archived: {
        [Op.eq]: false, // Get all that is not archived
      },
    });
    res
      .status(201)
      .json({ position, message: `Position data fetched successfully!` });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function updatePosition(req, res) {
  try {
    const [updatedRows] = await PositionModel.update(
      {
        position: req.body.position,
        description: req.body.description,
        approval_level: req.body.approval_level,
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

export async function deletePositionById(req, res) {
  try {
    const deletedRows = await PositionModel.destroy({
      where: {
        id: req.params.id,
      },
    });

    // If no rows were deleted, it means the reference number didn't match any requisition
    if (deletedRows === 0) {
      return res.status(404).json({
        message: `No position found with reference number ${req.params.id}`,
      });
    }

    res.status(200).json({
      message: "Position deleted from database!",
    });
  } catch (error) {
    res.status(500).json({
      message: `Encountered an internal error ${error}`,
      error: error,
    });
  }
}

export async function archivePositionById(req, res) {
  try {
    const [updatedRows] = await PositionModel.update(
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
