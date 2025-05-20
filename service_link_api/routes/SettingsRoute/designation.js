// routes/settings/designation.js
import express from "express";
import {
  createNewDesignation,
  getAllDesignation,
  getDesignationById,
  updateDesignation,
  archiveDesignationById,
} from "../../controllers/settings_controllers/designation.js";

const designationRouter = express.Router();

// Create a new designation
designationRouter.post("/", createNewDesignation);

// Get all designation
designationRouter.get("/", getAllDesignation);

// Get designation by ID
designationRouter.get("/:id", getDesignationById);

// Update designation
designationRouter.put("/:id", updateDesignation);

// Delete designation
designationRouter.delete("/:id/archive/:archive", archiveDesignationById);

export default designationRouter;
