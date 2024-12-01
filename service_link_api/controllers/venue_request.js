import sequelize from "../database.js";
import VenueRequisitionModel from "../models/VenueRequisitionModel.js";
import { Op } from 'sequelize';
import { createLog } from "./system_logs.js";

// Generate a unique reference number (e.g., DYCI-2024-0001)
function generateReferenceNumber(lastRequestId) {
    const year = new Date().getFullYear();
    const uniqueNumber = String(lastRequestId + 1).padStart(5, '0');
    return `VR-${year}-${uniqueNumber}`;
};

// Create Venue Requests
export async function createVenueRequest(req, res){
    try{

        // Generate a unique reference number
        const lastRequest = await VenueRequisitionModel.findOne({ order: [['id', 'DESC']] });
        const referenceNumber = generateReferenceNumber(lastRequest ? lastRequest.id : 0);

        // Create the venue requisition entry in the database
        const newVenueRequisition = await VenueRequisitionModel.create({
            reference_number: referenceNumber,
            venue_id: req.body.venue_id,
            requester_id: req.body.requester_id,
            department: req.body.department || null,
            organization: req.body.organization || null,
            event_title: req.body.event_title,
            purpose: req.body.purpose,
            event_nature: req.body.event_nature || null,
            event_dates: req.body.event_dates,
            event_start_time: req.body.event_start_time,
            event_end_time: req.body.event_end_time,
            participants: req.body.participants,
            pax_estimation: req.body.pax_estimation || 0,
            equipment_materials: req.body.equipment_materials || null,
            status: req.body.status || 'pending',
            remarks: req.body.remarks || null,
            immediate_head_approval: req.body.immediate_head_approval || 'pending',
            gso_director_approval: req.body.gso_director_approval || 'pending',
            operations_director_approval: req.body.operations_director_approval || 'pending',
            archived: req.body.archived || false,
          });

          res.status(201).json({message: `Request created successfully!`});

        //Log the request
        createLog({
            action: 'create',
            performed_by: req.body.requester_id,
            target: referenceNumber,
            details: `Venue Requisition ${referenceNumber} created successfully!`,
        });
    }catch (error){
        res.status(500).json({ message: `Encountered an internal error ${error}` })
    }
}

// Get All Venue Requests
export async function getAllVenueRequest(req, res) {
    try {
        const requisitions = await VenueRequisitionModel.findAll({
            where: {
                archived : {
                    [Op.eq]: false // Get all that is not archived
                }
            }
        });
        res.status(200).json(requisitions);
    } catch (error) {
        res.status(500).json({ message: `Error fetching venue requisitions`, error });
    }
}


// Get Venue Request by ID
export async function getVenueRequestById(req, res) {
    try{
        const requisition = await VenueRequisitionModel.findOne({
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
            res.status(200).json({requisition});
            console.log(requisition.title);
        }
    }catch (error) {
        res.status(500).json({ message: `Error fetching venue requisitions`, error });
    }
}

// Update Venue Request
export async function updateVenueRequest(req, res) {
    try{
        const [updatedRows] = await VenueRequisitionModel.update({
            venue_id: req.body.venue_id,
            requester_id: req.body.requester_id,
            department: req.body.department || null,
            organization: req.body.organization || null,
            event_title: req.body.event_title,
            purpose: req.body.purpose,
            event_nature: req.body.event_nature || null,
            event_dates: req.body.event_dates,
            event_start_time: req.body.event_start_time,
            event_end_time: req.body.event_end_time,
            participants: req.body.participants,
            pax_estimation: req.body.pax_estimation || 0,
            equipment_materials: req.body.equipment_materials || null,
            status: req.body.status || 'pending',
            remarks: req.body.remarks || null,
            immediate_head_approval: req.body.immediate_head_approval || 'pending',
            gso_director_approval: req.body.gso_director_approval || 'pending',
            operations_director_approval: req.body.operations_director_approval || 'pending',
            archived: req.body.archived || false,
        },
        {
            where: {
                reference_number : req.params.reference_number
            },
        });

         // If no rows were updated, it means the reference number didn't match any requisition
         if (updatedRows === 0) {
            return res.status(404).json({ message: `No requisition found with reference number ${req.body.reference_number}` });
        }

        console.log(req.body.venue_requested)
        res.status(200).json({ message: `Request updated successfully!`})

        //Log the request
        createLog({
            action: 'update',
            performed_by: req.body.requester_id,
            target: req.params.reference_number,
            details: `Venue Requisition ${req.params.reference_number} updated successfully!`,
        });
    }catch (error){
        res.status(500).json({ message: `Encountered an internal error ${error}`})
    }
}

// Delete / Archive Request
export async function archiveById(req, res){
    try{
        const [updatedRows] = await VenueRequisitionModel.update({
            archived: req.params.archive
        },{
            where: {
                reference_number :  req.params.reference_number
            },
        })

        // If no rows were updated, it means the reference number didn't match any requisition
        if (updatedRows === 0) {
            return res.status(404).json({ message: `No requisition found with reference number ${req.body.reference_number}` });
        }

        console.log(req.body.venue_requested)
        res.status(200).json({ message: req.params.archive === '0' ? 'Request removed from archive!' : 'Request added to archive!'});

        //Log the request
        createLog({
            action: 'archive',
            performed_by: req.body.requester_id,
            target: req.params.reference_number,
            details: `Venue Requisition ${req.params.reference_number} archived successfully!`,
        });
    }catch(error){
        res.status(500).json({ message: `Encountered an internal error ${error}`, error: error});
    }
}


// Approval of Immediate Head
export async function immediateHeadApproval(req, res){
    try{
        const [updatedRow] = await VenueRequisitionModel.update({
            immediate_head_approval: req.params.approval_flag
        },{
            where: {
                reference_number : req.params.reference_number
            }
        });

        // If no rows were updated, it means the reference number didn't match any requisition
        if (updatedRow === 0) {
            return res.status(404).json({ message: `No requisition found with reference number ${req.params.reference_number}` });
        }

        res.status(200).json({ message: `Request updated successfully!!`})

        //Log the request
        createLog({
            action: 'update',
            performed_by: req.body.requester_id,
            target: req.params.reference_number,
            details: `Venue Requisition ${req.params.reference_number} ${req.params.approval_flag} by immediate head!`,
        })
    }catch(error){
        res.status(500).json({ message: `Encountered an internal error ${error}`, error});
    }
}


// Approval of GSO Director
export async function gsoDirectorApproval(req, res){
    try{
        const [updatedRow] = await VenueRequisitionModel.update({
            gso_director_approval: req.params.approval_flag
        },{
            where: {
                reference_number : req.params.reference_number
            }
        });

        // If no rows were updated, it means the reference number didn't match any requisition
        if (updatedRow === 0) {
            return res.status(404).json({ message: `No requisition found with reference number ${req.body.reference_number}` });
        }

        console.log(req.body.venue_requested)
        res.status(200).json({ message: `Request updated successfully!`})

        //Log the request
        createLog({
            action: 'update',
            performed_by: req.body.requester_id,
            target: req.params.reference_number,
            details: `Venue Requisition ${req.params.reference_number} ${req.params.approval_flag} by GSO Director!`,
        })
    }catch(error){
        res.status(500).json({ message: `Encountered an internal error ${error}`, error});
    }
}


// Approval of Operations Director
export async function operationsDirectorApproval(req, res){
    try{
        const [updatedRow] = await VenueRequisitionModel.update({
            operations_director_approval: req.params.approval_flag
        },{
            where: {
                reference_number : req.params.reference_number
            }
        });

        // If no rows were updated, it means the reference number didn't match any requisition
        if (updatedRow === 0) {
            return res.status(404).json({ message: `No requisition found with reference number ${req.body.reference_number}` });
        }

        console.log(req.body.venue_requested)
        res.status(200).json({ message: `Request updated successfully!`})

        //Log the request
        createLog({
            action: 'update',
            performed_by: req.body.requester_id,
            target: req.params.reference_number,
            details: `Venue Requisition ${req.params.reference_number} ${req.params.approval_flag} by operations head!`,
        })
    }catch(error){
        res.status(500).json({ message: `Encountered an internal error ${error}`, error});
    }
}


// Get Venue Request by Status
export async function getAllVenueRequestByStatus(req, res) {
    try{
        const requisitions = await VenueRequisitionModel.findAll({
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
        res.status(500).json({ message: `Error fetching venue requisitions`, error});
    }
}



