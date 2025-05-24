import { Op } from "sequelize";
import ApprovalRule from "../../models/SettingsModels/ApprovalRuleByDesignationModel.js";
import Designation from "../../models/SettingsModels/DesignationModel.js";
import Position from "../../models/SettingsModels/PositionModel.js";

export async function createNewApprovalRuleByDesignation(req, res) {
  try {
    const newApprovalRule = await ApprovalRule.create({
      designation_id: req.body.designation_id,
      position_id: req.body.position_id,
      required: req.body.required,
    });

    res.status(201).json({ message: "Approval rule added successfully!" });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function getAllApprovalRulesByDesignation(req, res) {
  try {
    const allApprovalRules = await ApprovalRule.findAll({
      where: {
        archived: {
          [Op.eq]: false, // Get all that is not archived
        },
      },
      include: [
        {
          model: Designation,
          as: "designation",
          attributes: ["id", "designation"], // only fetch needed fields
        },
        {
          model: Position,
          as: "position",
          attributes: ["id", "position", "approval_level"],
        },
      ],
    });
    res.status(200).json({
      allApprovalRules,
      message: `All approval rules fetched successfully!`,
    });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function getApprovalRuleByIdByDesignation(req, res) {
  try {
    const approvalRule = await ApprovalRule.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Designation,
          as: "designation",
        },
        {
          model: Position,
          as: "position",
        },
      ],
    });

    if (!approvalRule) {
      return res.status(404).json({ message: "Approval rule not found" });
    }

    res.status(200).json({
      approvalRule,
      message: "Approval rule fetched successfully!",
    });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function updateApprovalRuleByDesignation(req, res) {
  try {
    const [updatedRows] = await ApprovalRule.update(
      {
        designation_id: req.body.designation_id,
        position_id: req.body.position_id,
        required: req.body.required,
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
        .json({ message: `No approval rule found with id ${req.params.id}` });
    }

    res.status(200).json({ message: "Approval rule updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function deleteApprovalRuleByIdByDesignation(req, res) {
  try {
    const deletedRows = await ApprovalRule.destroy({
      where: {
        id: req.params.id,
      },
    });

    // If no rows were deleted, it means the reference number didn't match any requisition
    if (deletedRows === 0) {
      return res.status(404).json({
        message: `No approval rule found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      message: "Approval rule deleted from database!",
    });
  } catch (error) {
    res.status(500).json({
      message: `Encountered an internal error ${error}`,
      error: error,
    });
  }
}

export async function archiveApprovalRuleByIdByDesignation(req, res) {
  try {
    const [updatedRows] = await ApprovalRule.update(
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
        .json({ message: `No approval rule found with id ${req.params.id}` });
    }

    res.status(200).json({ message: "Approval rule archived successfully!" });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}
