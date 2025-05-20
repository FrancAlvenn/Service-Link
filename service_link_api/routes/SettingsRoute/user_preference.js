// routes/settings/user_preference.js
import express from "express";
import {
  createUserPreference,
  getUserPreference,
  updateUserPreference,
  deleteUserPreference,
} from "../../controllers/settings_controllers/user_preference.js";

const userPreferenceRouter = express.Router();

// Create a new user preference
userPreferenceRouter.post("/", createUserPreference);

// Get user preference by user_id
userPreferenceRouter.get("/:user_id", getUserPreference);

// Update user preference by user_id
userPreferenceRouter.put("/:user_id", updateUserPreference);

// Delete user preference by user_id
userPreferenceRouter.delete("/:user_id", deleteUserPreference);

export default userPreferenceRouter;
