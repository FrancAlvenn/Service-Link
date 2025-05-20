import sequelize from "../../database.js";
import OrganizationModel from "../../models/SettingsModels/OrganizationModel.js";
import { Op } from "sequelize";

export async function createNewOrganization(req, res) {
  try {
    const newOrganization = await OrganizationModel.create({
      name: req.body.name,
      description: req.body.description,
      archived: false,
    });

    res.status(201).json({ message: `Organization added successfully!` });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function getAllOrganizations(req, res) {
  try {
    const organizations = await OrganizationModel.findAll({
      where: {
        archived: {
          [Op.eq]: false, // Get all that is not archived
        },
      },
    });
    res
      .status(201)
      .json({
        organizations,
        message: `Organization data fetched successfully!`,
      });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function getOrganizationById(req, res) {
  try {
    const organizations = await OrganizationModel.findAll({
      where: {
        id: req.params.id,
      },
      archived: {
        [Op.eq]: false, // Get all that is not archived
      },
    });
    res
      .status(201)
      .json({
        organizations,
        message: `Organization data fetched successfully!`,
      });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function updateOrganization(req, res) {
  try {
    const [updatedRows] = await OrganizationModel.update(
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
      return res
        .status(404)
        .json({ message: `No organization found with id ${req.params.id}` });
    }

    res.status(200).json({ message: `Organization updated successfully!` });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

export async function archiveOrganizationById(req, res) {
  try {
    const [updatedRows] = await OrganizationModel.update(
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
        .json({
          message: `No organization found with reference number ${req.params.id}`,
        });
    }

    res
      .status(200)
      .json({
        message:
          req.params.archive === "0"
            ? "Organization removed from archive!"
            : "Organization added to archive!",
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: `Encountered an internal error ${error}`,
        error: error,
      });
  }
}
