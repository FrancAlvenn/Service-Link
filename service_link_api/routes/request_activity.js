import express from "express";
import { createRequestActivity, getRequestActivities, updateRequestActivity, deleteRequestActivity } from "../controllers/request_activity.js";

const router = express.Router();

// Create a new request activity
router.post("/", createRequestActivity);

// Get all request activities for a specific request
router.get("/:request_id", getRequestActivities); // Fixed parameter name

// Update a specific activity
router.put("/:activity_id", updateRequestActivity);

// Delete a specific activity
router.delete("/:activity_id", deleteRequestActivity);

export default router;
