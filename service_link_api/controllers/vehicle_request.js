import VehicleRequisitionModel from "../models/VehicleRequisitionModel.js";
import { Op } from 'sequelize';

// Generate a unique reference number (e.g., DYCI-2024-0001)
function generateReferenceNumber(lastRequestId) {
    const year = new Date().getFullYear();
    const uniqueNumber = String(lastRequestId + 1).padStart(5, '0');
    return `SV-${year}-${uniqueNumber}`;
};

export async function createVehicleRequest(req, res){
    try{

        // Generate a unique reference number
        const lastRequest = await VehicleRequisitionModel.findOne({ order: [['id', 'DESC']] });
        const referenceNumber = generateReferenceNumber(lastRequest ? lastRequest.id : 0);

        // Create the vehicle requisition entry in the database
        const newVehicleRequisition = await VehicleRequisitionModel.create({
            reference_number : referenceNumber,
            vehicle_requested : "",
            date_filled : req.body.date_filled,
            date_of_trip : req.body.date_of_trip,
            time_of_departure : req.body.time_of_departure,
            time_of_arrival : req.body.time_of_arrival,
            number_of_passengers : req.body.number_of_passengers,
            destination : req.body.destination,
            purpose : req.body.purpose,
            requestor : req.body.requestor,
            designation : req.body.designation,
            status : req.body.status,
            vehicle_id : req.body.vehicle_id,
            remarks : req.body.remarks,
            immediate_head_approval : req.body.immediate_head_approval,
            gso_director_approval : req.body.gso_director_approval,
            operations_director_approval : req.body.operations_director_approval
        });

        res.status(201).json({message: `Request created successfully!`});
    }catch (error){
        res.status(500).json({ message: `Encountered an internal error ${error}` })
    }
}

export async function getAllVehicleRequest(req, res) {
    try {
        const requisitions = await VehicleRequisitionModel.findAll({
            where: {
                archived : {
                    [Op.eq]: false // Get all that is not archived
                }
            }
        });
        res.status(200).json(requisitions);
    } catch (error) {
        res.status(500).json({ message: `Error fetching vehicle requisitions`, error });
    }
}


export async function getAllVehicleRequestById(req, res) {
    try{
        const requisition = await VehicleRequisitionModel.findOne({
            where: {
                reference_number: req.params.reference_number
                },
                archived : {
                    [Op.eq]: false // Get all that is not archived
                }
        });
        console.log(req.params.reference_number)
        if (requisition === null) {
            res.status(404).json({message : 'Request not found!'});
          } else {
            res.status(200).json({message: requisition});
            console.log(requisition.title);
          }
    }catch (error) {
        res.status(500).json({ message: `Error fetching vehicle requisitions`, error });
    }
}


export async function updateVehicleRequest(req, res) {
    try{
        const [updatedRows] = await VehicleRequisitionModel.update({
            vehicle_requested : req.body.vehicle_requested,
            date_filled : req.body.date_filled,
            date_of_trip : req.body.date_of_trip,
            time_of_departure : req.body.time_of_departure,
            time_of_arrival : req.body.time_of_arrival,
            number_of_passengers : req.body.number_of_passengers,
            destination : req.body.destination,
            purpose : req.body.purpose,
            requestor : req.body.requestor,
            designation : req.body.designation,
            status : req.body.status,
            vehicle_id : req.body.vehicle_id,
            remarks : req.body.remarks,
            immediate_head_approval : req.body.immediate_head_approval,
            gso_director_approval : req.body.gso_director_approval,
            operations_director_approval : req.body.operations_director_approval
        },
        {
            where: {
                reference_number : req.body.reference_number
            },
        });

         // If no rows were updated, it means the reference number didn't match any requisition
         if (updatedRows === 0) {
            return res.status(404).json({ message: `No requisition found with reference number ${req.body.reference_number}` });
        }

        console.log(req.body.vehicle_requested)
        res.status(200).json({ message: `Request updated successfully!`})
    }catch (error){
        res.status(500).json({ message: `Encountered an internal error ${error}`})
    }
}


export async function getAllVehicleRequestByStatus(req, res) {
    try{
        const requisitions = await VehicleRequisitionModel.findAll({
            where: {
                status : req.params.status
            },
            archived : {
                [Op.eq]: false // Get all that is not archived
            }
        });
        console.log(req.params.status)
        if (requisitions === null){
            res.status(404).json({ message: `No request with the status - ${req.params.status}!`})
        }else{
            res.status(200).json({ message: requisitions});
        }
    }catch (error){
        res.status(500).json({ message: `Error fetching vehicle requisitions`, error});
    }
}