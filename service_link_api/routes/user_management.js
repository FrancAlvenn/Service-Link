import express from 'express';
import { archiveUserById, createUser, getAllUsers, getUserById, updateUserById } from '../controllers/user_management.js';

const router = express.Router();

// Route for POST
router.post("/", createUser);

// Route for GET
router.get("/", getAllUsers);

// Route for GET
router.get("/:reference_number", getUserById);

// Route for PATCH
router.put("/:reference_number", updateUserById);

// Route for DELETE
router.delete("/:reference_number/archive/:archive", archiveUserById );

export default router;