import express from 'express';
import { getAllVehicleRequest, getVehicleRequestById, getAllVehicleRequestByStatus, createVehicleRequest, updateVehicleRequest, archiveById, immediateHeadApproval, gsoDirectorApproval, operationsDirectorApproval, getVehicleRequestByTrip, updateRequestStatus } from '../controllers/vehicle_request.js';

const router = express.Router();

//Create a new Request
router.post('/', createVehicleRequest)

//Get all Vehicle Request
router.get("/", getAllVehicleRequest);

//Get Vehicle Request by Id
router.get("/:reference_number", getVehicleRequestById)

//Update a Request by its ID
router.put('/:reference_number', updateVehicleRequest)

//Update status of a Request
router.patch('/:reference_number/status', updateRequestStatus)

//Delete/Archive by Id
router.delete("/:reference_number/archive/:archive", archiveById)

//Patch Approve/reject by Immediate Head
router.patch("/:reference_number/immediate_head_approval/:approval_flag", immediateHeadApproval)

//Patch Approve/reject by GSO Director
router.patch("/:reference_number/gso_director_approval/:approval_flag", gsoDirectorApproval)

//Patch Approve/reject by Operations Head
router.patch("/:reference_number/operations_director_approval/:approval_flag", operationsDirectorApproval)

//Get all Vehicle Requests by Status
router.get("/status/:status", getAllVehicleRequestByStatus)

//Get all Vehicle Request by Date of Trip
router.get("/date/:date_of_trip", getVehicleRequestByTrip)

export default router;