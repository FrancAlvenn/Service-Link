import express from 'express';
import { 
   getAllVenueRequests, getVenueRequestById, updateVenueRequest, deleteVenueRequest, getVenueRequestByStatus, updateVenueRequestStatus,  getVenueRequestCountByStatus,
  createVenueRequest
} from '../controllers/venue_request.js';

const router = express.Router();


// Route to get all venues (GET)
router.get("/", getAllVenueRequests);

// Route to create a new venue (POST)
router.post("/create", createVenueRequest);

// Route to get a venue by ID (GET)
router.get("/:id", getVenueRequestById);

// Route to update a venue (PUT)
router.put("/:id", updateVenueRequest);

// Route to delete a venue (DELETE)
router.delete("/:id", deleteVenueRequest);

// Route to get venues by status (GET)
router.get("/status/:status", getVenueRequestByStatus);

// Route to update venue status (PATCH)
router.patch("/:id/status", updateVenueRequestStatus);

// Route to get the count of venues by status (GET)
router.get("/status/count", getVenueRequestCountByStatus);

export default router;
