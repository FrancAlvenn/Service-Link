import express from "express";
import {
  createAssetAssignmentLog,
  deleteAssetAssignmentLog,
  getAllAssetAssignmentLogs,
  getAssetAssignmentLogById,
  updateAssetAssignmentLog,
} from "../controllers/assets.js";

const router = express.Router();

//Asset Assignment Logs

// Route to get all asset assignment logs (GET)
router.get("/", getAllAssetAssignmentLogs);

router.post("/", createAssetAssignmentLog);

// Route to get an asset assignment log by ID (GET)
router.get("/:log_id", getAssetAssignmentLogById);

// Route to update an asset assignment log (PUT)
router.put("/:log_id", updateAssetAssignmentLog);

// Route to delete an asset assignment log (DELETE)
router.delete("/:log_id", deleteAssetAssignmentLog);

export default router;
