import { Op } from "sequelize";
import ManualApprovalRule from "../../models/SettingsModels/ManualApprovalRuleModel.js";

export async function createNewManualApprovalRule(req, res) {
  try {
    const newManualApprovalRule = await ManualApprovalRule.create({
      department: req.body.department,
      position: req.body.position,
      reference_number: req.body.reference_number,
      name: req.body.name,
      email: req.body.email,
    });

    res.status(201).json({ message: "Approval rule added successfully!" });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function getAllManualApprovalRules(req, res) {
  try {
    const allManualApprovalRules = await ManualApprovalRule.findAll({
      where: {
        archived: {
          [Op.eq]: false, // Get all that is not archived
        },
      },
    });
    res.status(201).json({
      allManualApprovalRules,
      message: `All manual approval rules fetched successfully!`,
    });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function getManualApprovalRuleById(req, res) {
  try {
    const manualApprovalRule = await ManualApprovalRule.findOne({
      where: { id: req.params.id },
    });

    if (!manualApprovalRule) {
      return res
        .status(404)
        .json({ message: "Manual approval rule not found" });
    }

    res.status(200).json({
      manualApprovalRule,
      message: "Manual approval rule fetched successfully!",
    });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function updateManualApprovalRule(req, res) {
  try {
    const [updatedRows] = await ManualApprovalRule.update(
      {
        department: req.body.department,
        position: req.body.position,
        reference_number: req.body.reference_number,
        name: req.body.name,
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
        .json({ message: `No approval rule found with id ${req.params.id}` });
    }

    res.status(200).json({ message: "Approval rule updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function deleteManualApprovalRuleById(req, res) {
  try {
    const deletedRows = await ManualApprovalRule.destroy({
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

export async function archiveManualApprovalRuleById(req, res) {
  try {
    const [updatedRows] = await ManualApprovalRule.update(
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
