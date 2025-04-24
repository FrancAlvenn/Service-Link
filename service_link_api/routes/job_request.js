import express from "express";
import {
  getAllJobRequest,
  getJobRequestById,
  getAllArchivedJobRequests,
  getAllJobRequestByStatus,
  createJobRequest,
  updateJobRequest,
  archiveById,
  immediateHeadApproval,
  gsoDirectorApproval,
  operationsDirectorApproval,
  updateRequestStatus,
  createNewDetail,
} from "../controllers/job_request.js";

const router = express.Router();

//Create a new Request
router.post("/", createJobRequest);

//Create a new detail
router.post("/:reference_number/detail", createNewDetail);

//Get all Job Request
router.get("/", getAllJobRequest);

//Get all Archived Job Requests
router.get("/archived", getAllArchivedJobRequests);

//Get Job Request by Id
router.get("/:reference_number", getJobRequestById);

//Update a Request by its ID
router.put("/:reference_number", updateJobRequest);

//Update status of a Request
router.patch("/:reference_number/status", updateRequestStatus);

//Delete/Archive by Id
router.delete("/:reference_number/archive/:archive", archiveById);

//Patch Approve/reject by Immediate Head
router.patch(
  "/:reference_number/immediate_head_approval/:approval_flag",
  immediateHeadApproval
);

//Patch Approve/reject by GSO Director
router.patch(
  "/:reference_number/gso_director_approval/:approval_flag",
  gsoDirectorApproval
);

//Patch Approve/reject by Operations Head
router.patch(
  "/:reference_number/operations_director_approval/:approval_flag",
  operationsDirectorApproval
);

//Get all Job Requests by Status
router.get("/status/:status", getAllJobRequestByStatus);

export default router;
