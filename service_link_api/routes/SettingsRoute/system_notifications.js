import express from "express";
import {
  createSystemNotification,
  getSystemNotifications,
  updateSystemNotification,
  deleteSystemNotification,
  getUnreadCount,
  markNotificationViewed,
} from "../../controllers/settings_controllers/system_notifications";

const router = express.Router();

// Create a new request activity
router.post("/", createSystemNotification);

// Get all request activities for a specific request
router.get("/", getSystemNotifications); // Fixed parameter name

// Update a specific activity
router.put("/:id", updateSystemNotification);

// Delete a specific activity
router.delete("/:id", deleteSystemNotification);

export default router;
