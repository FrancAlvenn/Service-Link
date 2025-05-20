// routes/settings/priority.js
import express from "express";
import {
  createNewPriority,
  getAllPriority,
  getPriorityById,
  updatePriority,
  archivePriorityById,
} from "../../controllers/settings_controllers/priority_level.js";

const priorityRouter = express.Router();

// Create a new priority
priorityRouter.post("/", createNewPriority);

// Get all priority
priorityRouter.get("/", getAllPriority);

// Get priority by ID
priorityRouter.get("/:id", getPriorityById);

// Update priority
priorityRouter.put("/:id", updatePriority);

// Delete priority
priorityRouter.delete("/:id/archive/:archive", archivePriorityById);

export default priorityRouter;
