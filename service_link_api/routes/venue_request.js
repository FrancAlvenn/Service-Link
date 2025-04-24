import express from "express";
import {
  getAllVenueRequest,
  getVenueRequestById,
  getAllArchivedVenueRequest,
  getAllVenueRequestByStatus,
  createVenueRequest,
  updateVenueRequest,
  archiveById,
  immediateHeadApproval,
  gsoDirectorApproval,
  operationsDirectorApproval,
  updateRequestStatus,
} from "../controllers/venue_request.js";

const router = express.Router();

//Create a new Request
router.post("/", createVenueRequest);

//Get all Venue Request
router.get("/", getAllVenueRequest);

//Get all archived requests
router.get("/", getAllArchivedVenueRequest);

//Get Venue Request by Id
router.get("/:reference_number", getVenueRequestById);

//Update a Request by its ID
router.put("/:reference_number", updateVenueRequest);

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

//Get all Venue Requests by Status
router.get("/status/:status", getAllVenueRequestByStatus);

export default router;
