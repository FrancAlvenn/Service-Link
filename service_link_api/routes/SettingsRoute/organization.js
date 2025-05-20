// routes/settings/organization.js
import express from "express";
import {
  createNewOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  archiveOrganizationById,
} from "../../controllers/settings_controllers/organization.js";

const organizationRouter = express.Router();

// Create a new organization
organizationRouter.post("/", createNewOrganization);

// Get all organizations
organizationRouter.get("/", getAllOrganizations);

// Get organization by ID
organizationRouter.get("/:id", getOrganizationById);

// Update organization
organizationRouter.put("/:id", updateOrganization);

// Delete organization
organizationRouter.delete("/:id/archive/:archive", archiveOrganizationById);

export default organizationRouter;
