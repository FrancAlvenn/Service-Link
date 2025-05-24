import { Op } from "sequelize";
import Approvers from "../../models/SettingsModels/ApproversModel.js";
import PositionModel from "../../models/SettingsModels/PositionModel.js";
import Department from "../../models/SettingsModels/DeparmentsModel.js";

export async function createNewApprover(req, res) {
  try {
    const newApprover = await Approvers.create({
      reference_number: req.body.reference_number,
      name: req.body.name,
      position_id: req.body.position_id,
      department_id: req.body.department_id,
      email: req.body.email,
    });

    res.status(201).json({ message: "Approver added successfully!" });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function getAllApprovers(req, res) {
  try {
    const allApprovers = await Approvers.findAll({
      where: {
        archived: {
          [Op.eq]: false, // Get all that is not archived
        },
      },
      include: [
        {
          model: PositionModel,
          as: "position",
        },
        {
          model: Department,
          as: "department",
        },
      ],
    });
    res
      .status(201)
      .json({ allApprovers, message: `All approvers fetched successfully!` });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function getApproversById(req, res) {
  try {
    const approver = await Approvers.findOne({ where: { id: req.params.id } });

    if (!approver) {
      return res.status(404).json({ message: "Approver not found" });
    }

    res
      .status(200)
      .json({ approver, message: "Approver fetched successfully!" });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function updateApproversById(req, res) {
  try {
    const [updatedRows] = await Approvers.update(
      {
        reference_number: req.body.reference_number,
        name: req.body.name,
        position_id: req.body.position_id,
        department_id: req.body.department_id,
        email: req.body.email,
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
        .json({ message: `No approver found with id ${req.params.id}` });
    }

    res.status(200).json({ message: "Approver updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function deleteApproversById(req, res) {
  try {
    const deletedRows = await Approvers.destroy({
      where: {
        id: req.params.id,
      },
    });

    // If no rows were deleted, it means the reference number didn't match any requisition
    if (deletedRows === 0) {
      return res.status(404).json({
        message: `No approver found with reference number ${req.params.id}`,
      });
    }

    res.status(200).json({
      message: "Approver deleted from database!",
    });
  } catch (error) {
    res.status(500).json({
      message: `Encountered an internal error ${error}`,
      error: error,
    });
  }
}

export async function archiveApproversById(req, res) {
  try {
    const [updatedRows] = await Approvers.update(
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
      return res
        .status(404)
        .json({ message: `No approver found with id ${req.params.id}` });
    }

    res.status(200).json({ message: "Approver archived successfully!" });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}
