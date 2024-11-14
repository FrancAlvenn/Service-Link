import express from 'express';
import { getAllVehicleRequest, getAllVehicleRequestById, getAllVehicleRequestByStatus, createVehicleRequest, updateVehicleRequest } from '../controllers/vehicle_request.js';

const router = express.Router();

//Create a new Request
router.post('/', createVehicleRequest)

//Get all Vehicle Request
router.get("/", getAllVehicleRequest);

//Get Vehicle Request by Id
router.get("/:reference_number", getAllVehicleRequestById)

//Update a Request by its ID
router.put('/:reference_number', updateVehicleRequest)

//Get all Vehicle Requests by Status
router.get("/status/:status", getAllVehicleRequestByStatus)



export default router;