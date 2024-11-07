import express from 'express';
import {
  createJobRequest, getAllJobRequests, getJobRequestById, updateJobRequest, deleteJobRequest, getJobRequestsByStatus, assignJobRequest, updateJobRequestStatus, getJobRequestCountByStatus
} from '../controllers/job_request.js';

const router = express.Router();

// Route to get all job requests (GET)
router.get("/", getAllJobRequests);

// Route to create a new job request (POST)
router.post("/create", createJobRequest);

// Route to get a job request by ID (GET)
router.get("/:request_id", getJobRequestById);

// Route to update a job request (PUT)
router.put("/:id", updateJobRequest);

// Route to delete a job request (DELETE)
router.delete("/:id", deleteJobRequest);

// Route to get job requests by status (GET)
router.get("/status/:status", getJobRequestsByStatus);

// Route to assign a job request (POST)
router.post("/assign/:id", assignJobRequest);

// Route to update job request status (PATCH)
router.patch("/:id/status", updateJobRequestStatus);

// Route to get the count of job requests by status (GET)
router.get("/status/count", getJobRequestCountByStatus);

export default router;
