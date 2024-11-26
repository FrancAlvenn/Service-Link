import sequelize from "../database.js";
import TicketModel from "../models/TicketModel.js";
import { Op } from 'sequelize';

// Generate a unique reference number (e.g., DYCI-2024-0001)
function generateReferenceNumber(lastRequestId) {
    const year = new Date().getFullYear();
    const uniqueNumber = String(lastRequestId + 1).padStart(5, '0');
    return `TK-${year}-${uniqueNumber}`;
};

// Create Vehicle Requests
export async function createTicket(req, res){
    try{

        // Generate a unique reference number
        const lastRequest = await TicketModel.findOne({ order: [['id', 'DESC']] });
        const referenceNumber = generateReferenceNumber(lastRequest ? lastRequest.id : 0);

        // Create the vehicle requisition entry in the database
        const newTicket = await TicketModel.create({
            ticket_id : referenceNumber,
            reference_number : req.body.reference_number,
            status: req.body.status,
            priority_level: req.body.priority_level,
            created_by: req.body.created_by,
            assigned_to: req.body.assigned_to,
            remarks: req.body.remarks,
            archived: req.body.archived
        });

        res.status(201).json({message: `Ticket created successfully!`});
    }catch (error){
        res.status(500).json({ message: `Encountered an internal error ${error}` })
    }
}

// Get All Vehicle Requests
export async function getAllTicket(req, res) {
    try {
        const requisitions = await TicketModel.findAll({
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


// Get Vehicle Request by ID
export async function getTicketById(req, res) {
    try{
        const requisition = await TicketModel.findOne({
            where: {
                ticket_id: req.params.ticket_id
                },
                archived : {
                    [Op.eq]: false // Get all that is not archived
                }
        });
        console.log(req.params.reference_number)
        if (requisition === null) {
            res.status(404).json({message : 'Ticket not found!'});
        } else {
            res.status(200).json({requisition});
            console.log(requisition.title);
        }
    }catch (error) {
        res.status(500).json({ message: `Error fetching vehicle requisitions`, error });
    }
}

// Update Vehicle Request
export async function updateTicket(req, res) {
    try{
        const [updatedRows] = await TicketModel.update({
            status: req.body.status,
            priority_level: req.body.priority_level,
            assigned_to: req.body.assigned_to,
            remarks: req.body.remarks,
            archived: req.body.archived
        },
        {
            where: {
                ticket_id : req.params.ticket_id
            },
        });

         // If no rows were updated, it means the reference number didn't match any requisition
         if (updatedRows === 0) {
            return res.status(404).json({ message: `No ticket found with reference number ${req.body.reference_number}` });
        }

        console.log(req.body.vehicle_requested)
        res.status(200).json({ message: `Ticket updated successfully!`})
    }catch (error){
        res.status(500).json({ message: `Encountered an internal error ${error}`})
    }
}

// Delete / Archive Request
export async function archiveById(req, res){
    try{
        const [updatedRows] = await TicketModel.update({
            archived: req.params.archive
        },{
            where: {
                ticket_id :  req.params.ticket_id
            },
        })

        // If no rows were updated, it means the reference number didn't match any requisition
        if (updatedRows === 0) {
            return res.status(404).json({ message: `No ticket found with reference number ${req.body.reference_number}` });
        }

        console.log(req.body.vehicle_requested)
        res.status(200).json({ message: req.params.archive === '0' ? 'Ticket removed from archive!' : 'Ticket added to archive!'});
    }catch(error){
        res.status(500).json({ message: `Encountered an internal error ${error}`, error: error});
    }
}

