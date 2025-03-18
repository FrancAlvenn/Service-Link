import express from "express";
import { createAsset, deleteAsset, getAllAssets, getAssetById, updateAsset } from "../controllers/assets.js";

const router = express.Router();


// Route to create a new asset (POST)
router.post("/", createAsset)

// Route to get all assets (GET)
router.get("/", getAllAssets)

// Route to get an asset by ID (GET)
router.get("/:reference_number", getAssetById)

// Route to update an asset (PUT)
router.put("/:reference_number", updateAsset)

// Route to delete an asset (DELETE)
router.delete("/:reference_number", deleteAsset)

export default router
