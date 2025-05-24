import { Op } from "sequelize";
import ApprovalRule from "../../models/SettingsModels/ApprovalRuleByDepartmentModel.js";
import Department from "../../models/SettingsModels/DeparmentsModel.js";
import Position from "../../models/SettingsModels/PositionModel.js";

export async function createNewApprovalRuleByDepartment(req, res) {
  try {
    const newApprovalRule = await ApprovalRule.create({
      department_id: req.body.department_id,
      position_id: req.body.position_id,
      required: req.body.required,
    });

    res.status(201).json({ message: "Approval rule added successfully!" });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function getAllApprovalRulesByDepartment(req, res) {
  try {
    const allApprovalRules = await ApprovalRule.findAll({
      where: {
        archived: false,
      },
      include: [
        {
          model: Department,
          as: "department",
        },
        {
          model: Position,
          as: "position",
        },
      ],
    });

    res.status(200).json({
      allApprovalRules,
      message: "All approval rules fetched successfully!",
    });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function getApprovalRuleByIdByDepartment(req, res) {
  try {
    const approvalRule = await ApprovalRule.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"], // only fetch needed fields
        },
        {
          model: Position,
          as: "position",
          attributes: ["id", "position"],
        },
      ],
    });

    if (!approvalRule) {
      return res.status(404).json({ message: "Approval rule not found" });
    }

    res
      .status(200)
      .json({ approvalRule, message: "Approval rule fetched successfully!" });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function updateApprovalRuleByDepartment(req, res) {
  try {
    const [updatedRows] = await ApprovalRule.update(
      {
        department_id: req.body.department_id,
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

export async function deleteApprovalRuleByIdByDepartment(req, res) {
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

export async function archiveApprovalRuleByIdByDepartment(req, res) {
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
