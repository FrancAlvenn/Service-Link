// routes/settings/status.js
import express from "express";
import {
  createNewStatus,
  getAllStatus,
  getStatusById,
  updateStatus,
  deleteStatusById,
} from "../../controllers/settings_controllers/status.js";

const statusRouter = express.Router();

// Create a new status
statusRouter.post("/", createNewStatus);

// Get all status
statusRouter.get("/", getAllStatus);

// Get status by ID
statusRouter.get("/:id", getStatusById);

// Update status
statusRouter.put("/:id", updateStatus);

// Delete status
statusRouter.delete("/:id", deleteStatusById);
