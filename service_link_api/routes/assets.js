import express from "express";
import {
  createAsset,
  deleteAsset,
  deleteAssetAssignmentLog,
  getAllAssetAssignmentLogs,
  getAllAssets,
  getAssetAssignmentLogById,
  getAssetById,
  updateAsset,
  updateAssetAssignmentLog,
} from "../controllers/assets.js";

const router = express.Router();

// Route to create a new asset (POST)
router.post("/", createAsset);

// Route to get all assets (GET)
router.get("/", getAllAssets);

// Route to get an asset by ID (GET)
router.get("/:reference_number", getAssetById);

// Route to update an asset (PUT)
router.put("/:reference_number", updateAsset);

// Route to delete an asset (DELETE)
router.delete("/:reference_number", deleteAsset);

//Asset Assignment Logs

// Route to get all asset assignment logs (GET)
router.get("/assignment-logs", getAllAssetAssignmentLogs);

// Route to get an asset assignment log by ID (GET)
router.get("/assignment-logs/:log_id", getAssetAssignmentLogById);

// Route to update an asset assignment log (PUT)
router.put("/assignment-logs/:log_id", updateAssetAssignmentLog);

// Route to delete an asset assignment log (DELETE)
router.delete("/assignment-logs/:log_id", deleteAssetAssignmentLog);

export default router;
