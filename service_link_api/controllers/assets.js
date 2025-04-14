import sequelize from "../database.js";
import AssetModel from "../models/AssetsModel.js";
import { Op } from "sequelize";
import { createLog } from "./system_logs.js";

// Generate a unique reference number for the asset (e.g., AST-2025-00001)
function generateAssetReferenceNumber(lastAssetId) {
  const year = new Date().getFullYear();
  const uniqueNumber = String(lastAssetId + 1).padStart(5, "0");
  return `AST-${year}-${uniqueNumber}`;
}

export async function createAsset(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Generate unique reference number
    const lastAsset = await AssetModel.findOne({
      order: [["asset_id", "DESC"]],
    });
    const referenceNumber = generateAssetReferenceNumber(
      lastAsset ? lastAsset.asset_id : 0
    );

    // Ensure additional_details is an array
    const additionalDetails = Array.isArray(req.body.additional_details)
      ? req.body.additional_details
      : [];

    const newAsset = await AssetModel.create(
      {
        reference_number: referenceNumber,
        name: req.body.name,
        asset_type: req.body.asset_type,
        description: req.body.description,
        location: req.body.location,
        purchase_date:
          req.body.purchase_date || new Date().toISOString().split("T")[0],
        purchase_cost: req.body.purchase_cost,
        status: req.body.status || "Available",
        last_maintenance: req.body.last_maintenance,
        warranty_expiry: req.body.warranty_expiry || null,
        additional_details: additionalDetails, // Store as an array
      },
      { transaction }
    );

    await transaction.commit();

    createLog({
      action: "create",
      target: referenceNumber,
      performed_by: req.body.user || "system",
      title: "Asset Created",
      details: `Asset with reference number ${referenceNumber} created successfully!`,
    });

    res.status(201).json({ message: "Asset created successfully!", newAsset });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating asset", error: error.message });
  }
}

// Get all Assets
export async function getAllAssets(req, res) {
  try {
    const assets = await AssetModel.findAll({
      where: { status: { [Op.ne]: "Archived" } },
    });

    if (!assets.length) {
      return res.status(404).json({ message: "No assets found." });
    }

    res.status(200).json(assets);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching assets", error: error.message });
  }
}

// Get Asset by Reference Number
export async function getAssetById(req, res) {
  try {
    const asset = await AssetModel.findOne({
      where: { reference_number: req.params.reference_number },
    });

    if (!asset) {
      return res.status(404).json({ message: "Asset not found." });
    }

    res.status(200).json(asset);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching asset", error: error.message });
  }
}

export async function updateAsset(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const asset = await AssetModel.findOne({
      where: { reference_number: req.params.reference_number },
    });

    if (!asset) {
      return res.status(404).json({ message: "Asset not found." });
    }

    // Ensure additional_details is an array and merge with existing data
    const updatedAdditionalDetails = Array.isArray(req.body.additional_details)
      ? req.body.additional_details
      : asset.additional_details;

    await asset.update(
      {
        name: req.body.name,
        asset_type: req.body.asset_type,
        description: req.body.description,
        location: req.body.location,
        purchase_date: req.body.purchase_date,
        purchase_cost: req.body.purchase_cost,
        status: req.body.status,
        last_maintenance: req.body.last_maintenance,
        warranty_expiry: req.body.warranty_expiry,
        additional_details: updatedAdditionalDetails, // Store as an array
      },
      { transaction }
    );

    await transaction.commit();

    createLog({
      action: "update",
      target: req.params.reference_number,
      performed_by: req.body.user || "system",
      title: "Asset Updated",
      details: `Asset with reference number ${req.params.reference_number} updated successfully.`,
    });

    res.status(200).json({ message: "Asset updated successfully!" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating asset", error: error.message });
  }
}

// Archive an Asset
export async function deleteAsset(req, res) {
  try {
    const [updatedRows] = await AssetModel.update(
      { status: "Archived" },
      { where: { reference_number: req.params.reference_number } }
    );

    if (updatedRows === 0) {
      return res
        .status(404)
        .json({ message: "Asset not found or already archived." });
    }

    createLog({
      action: "archive",
      target: req.params.reference_number,
      performed_by: req.body.user || "system",
      title: "Asset Archived",
      details: `Asset with reference number ${req.params.reference_number} archived successfully.`,
    });

    res.status(200).json({ message: "Asset archived successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error archiving asset", error: error.message });
  }
}

// Get Assets by Status
export async function getAssetsByStatus(req, res) {
  try {
    const assets = await AssetModel.findAll({
      where: { status: req.params.status },
    });

    if (!assets.length) {
      return res
        .status(404)
        .json({ message: `No assets with status ${req.params.status}` });
    }

    res.status(200).json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching assets by status",
      error: error.message,
    });
  }
}
