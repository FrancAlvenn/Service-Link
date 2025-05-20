import sequelize from "../../database.js";
import StatusModel from "../../models/SettingsModels/StatusModel.js";
import { Op } from "sequelize";

export async function createNewStatus(req, res) {
  try {
    const newStatus = await StatusModel.create({
      status: req.body.status,
      description: req.body.description,
      color: req.body.color,
    });

    res.status(201).json({ message: `Status added successfully!` });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function getAllStatus(req, res) {
  try {
    const status = await StatusModel.findAll({
      where: {
        archived: {
          [Op.eq]: false, // Get all that is not archived
        },
      },
    });
    res
      .status(201)
      .json({ status, message: `Status data fetched successfully!` });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function getStatusById(req, res) {
  try {
    const status = await StatusModel.findAll({
      where: {
        id: req.params.id,
      },
      archived: {
        [Op.eq]: false, // Get all that is not archived
      },
    });
    res
      .status(201)
      .json({ status, message: `Status data fetched successfully!` });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function updateStatus(req, res) {
  try {
    const [updatedRows] = await StatusModel.update(
      {
        status: req.body.status,
        description: req.body.description,
        color: req.body.color,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    // If no rows were updated, it means the reference number didn't match any requisition
    if (updatedRows === 0) {
      return res
        .status(404)
        .json({ message: `No status found with id ${req.params.id}` });
    }

    res.status(200).json({ message: `Status updated successfully!` });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function archiveStatusById(req, res) {
  try {
    const [updatedRows] = await StatusModel.update(
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
        message: `No status found with reference number ${req.params.id}`,
      });
    }

    res.status(200).json({
      message:
        req.params.archive === "0"
          ? "Status removed from archive!"
          : "Status added to archive!",
    });
  } catch (error) {
    res.status(500).json({
      message: `Encountered an internal error ${error}`,
      error: error,
    });
  }
}
