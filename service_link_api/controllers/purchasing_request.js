import sequelize from "../database.js";
import { PurchasingRequestModel, PurchasingRequestDetails } from '../models/index.js';
import { Op } from 'sequelize';
import { createLog } from "./system_logs.js";

// Generate a unique reference number (e.g., PR-2024-0001)
function generateReferenceNumber(lastRequestId) {
    const year = new Date().getFullYear();
    const uniqueNumber = String(lastRequestId + 1).padStart(5, '0');
    return `PR-${year}-${uniqueNumber}`;
};

// Create Purchasing Request
export async function createPurchasingRequest(req, res) {
    let transaction;
    try {
        transaction = await sequelize.transaction();

        // Generate a unique reference number
        const lastRequest = await PurchasingRequestModel.findOne({ order: [['id', 'DESC']] });
        const referenceNumber = generateReferenceNumber(lastRequest ? lastRequest.id : 0);

        const newPurchasingRequest = await PurchasingRequestModel.create({
            reference_number: referenceNumber,
            title : req.body.title,
            supply_category: req.body.supply_category,
            date_required: req.body.date_required,
            department: req.body.department,
            purpose: req.body.purpose,
            requester: req.body.requester,
            status: req.body.status,
            immediate_head_approval: req.body.immediate_head_approval,
            gso_director_approval: req.body.gso_director_approval,
            operations_director_approval: req.body.operations_director_approval,
            archived: req.body.archived || false,
            remarks: req.body.remarks || null,
        }, { transaction });

        const detailsData = req.body.details.map(detail => ({
            purchasing_request_id: newPurchasingRequest.reference_number,
            quantity: detail.quantity || null,
            particulars: detail.particulars,
            description: detail.description,
            remarks: detail.remarks || null,
        }));

        await PurchasingRequestDetails.bulkCreate(detailsData, { transaction });

        await transaction.commit();

        createLog({
            action: 'create',
            target: referenceNumber,
            performed_by: req.body.requester,
            title: 'Request Submitted',
            details: `Purchasing Request with reference number ${referenceNumber} created successfully!`,
        });

        res.status(201).json({ message: `Purchasing request created successfully!` });
    } catch (error) {
        // Rollback the transaction in case of error
        if (transaction) await transaction.rollback();
        console.error(error);
        res.status(500).json({ message: 'Error creating purchasing request', error: error.message });
    }
}

// Get All Purchasing Requests
export async function getAllPurchasingRequests(req, res) {
    try {
        const requests = await PurchasingRequestModel.findAll({
            where: {
                archived: {
                    [Op.eq]: false,
                },
            },
            include: [
                {
                    model: PurchasingRequestDetails,
                    as: 'details',
                },
            ],
        });

        if (!requests || requests.length === 0) {
            res.status(404).json({ message: 'No purchasing requests found!' });
        } else {
            res.status(200).json(requests);
        }
    } catch (error) {
        res.status(500).json({ message: `Error fetching purchasing requests!`, error });
    }
}

// Get Purchasing Request by Reference Number
export async function getPurchasingRequestById(req, res) {
    try {
        const request = await PurchasingRequestModel.findOne({
            where: { reference_number: req.params.reference_number },
            include: [{ model: PurchasingRequestDetails, as: 'details' }],
        });

        if (!request) {
            res.status(404).json({ message: 'Purchasing request not found!' });
        } else {
            res.status(200).json(request);
        }
    } catch (error) {
        res.status(500).json({ message: `Error fetching purchasing request`, error });
    }
}

// Update Purchasing Request
export async function updatePurchasingRequest(req, res) {
    let transaction;
    try {
        transaction = await sequelize.transaction();

        const [updatedRows] = await PurchasingRequestModel.update(
            {
                title: req.body.title,
                supply_category: req.body.supply_category,
                date_required: req.body.date_required,
                department: req.body.department,
                purpose: req.body.purpose,
                requester: req.body.requester,
                status: req.body.status,
                immediate_head_approval: req.body.immediate_head_approval,
                gso_director_approval: req.body.gso_director_approval,
                operations_director_approval: req.body.operations_director_approval,
                archived: req.body.archived,
                remarks: req.body.remarks || null,
            },
            {
                where: {
                    reference_number:
                    req.params.reference_number
                },
                transaction,
            }
        );

        if (updatedRows === 0) {
            return res.status(404).json({
                message: `No purchasing request found with reference number ${req.params.reference_number}`,
            });
        }

        const existingDetails = await PurchasingRequestDetails.findAll({
            where: { purchasing_request_id: req.params.reference_number },
            attributes: ['id'],
            transaction,
        });

        const existingDetailIds = existingDetails.map((detail) => detail.id);

        const incomingDetailIds = req.body.details
            .filter((detail) => detail.id)
            .map((detail) => detail.id);

        const detailsToDelete = existingDetailIds.filter(
            (id) => !incomingDetailIds.includes(id)
        );

        if (detailsToDelete.length > 0) {
            await PurchasingRequestDetails.destroy({
                where: { id: detailsToDelete },
                transaction,
            });
        }

        //If detail has id then update, else if its a new detail then create
        for (const detail of req.body.details) {
            if (detail.id) {
                await PurchasingRequestDetails.update(
                    {
                        quantity: detail.quantity || null,
                        particulars: detail.particulars,
                        description: detail.description,
                        remarks: detail.remarks || null,
                    },
                    {
                        where: { id: detail.id },
                        transaction,
                    }
                );
            } else {
                await PurchasingRequestDetails.create(
                    {
                        purchasing_request_id: req.params.reference_number,
                        quantity: detail.quantity || null,
                        particulars: detail.particulars,
                        description: detail.description,
                        remarks: detail.remarks || null,
                    },
                    { transaction }
                );
            }
        }

        await transaction.commit();

        createLog({
            action: 'update',
            performed_by: req.body.requester,
            target: req.params.reference_number,
            title: 'Request Updated',
            details: `Purchasing Request ${req.params.reference_number} updated successfully!`,
        });

        res.status(200).json({ message: `Purchasing request updated successfully!` });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error(error);
        res.status(500).json({ message: `Error updating purchasing request`, error });
    }
}


// Update Request Status
export async function updateRequestStatus(req, res) {
    try {
        const { status } = req.body; // Get the new status from the request body

        // Check if status is provided
        if (!status) {
            return res.status(400).json({ message: "Status is required." });
        }

        // Update the job request status
        const [updatedRow] = await PurchasingRequestModel.update(
            { status }, // Only update the status field
            {
                where: {
                    reference_number: req.params.reference_number,
                },
            }
        );

        // If no rows were updated, it means the reference number didn't match any job request
        if (updatedRow === 0) {
            return res.status(404).json({
                message: `No job request found with reference number ${req.params.reference_number}`,
            });
        }

        // Return success response
        res.status(200).json({
            message: `Request status updated to "${status}" successfully!`,
        });

        // Log the status update action
        createLog({
            action: 'update',
            performed_by: req.body.requester,
            target: req.params.reference_number,
            title: 'Request Status Updated',
            details: `Request ${req.params.reference_number} status updated to "${status}"`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Error updating job request status`, error });
    }
}

// Archive / Unarchive Purchasing Request
export async function archivePurchasingRequest(req, res) {
    try {
        const [updatedRows] = await PurchasingRequestModel.update(
            {
                archived: req.params.archive === '1',
            },
            {
                where: { reference_number: req.params.reference_number },
            }
        );

        if (updatedRows === 0) {
            return res.status(404).json({ message: `No purchasing request found!` });
        }

        createLog({
            action: 'archive',
            performed_by: req.body.requester,
            target: req.params.reference_number,
            title: 'Request Archived',
            details: `Purchasing Request ${req.params.reference_number} archived successfully!`,
        });

        res.status(200).json({ message: req.params.archive === '0' ? 'Request removed from archive!' : 'Request added to archive!'});
    } catch (error) {
        res.status(500).json({ message: `Error archiving purchasing request`, error });
    }
}


export async function immediateHeadApproval(req, res){
    try{
        const [updatedRow] = await PurchasingRequestModel.update({
            immediate_head_approval: req.params.approval_flag
        },{
            where: {
                reference_number : req.params.reference_number
            }
        });

        // If no rows were updated, it means the reference number didn't match any requisition
        if (updatedRow === 0) {
            return res.status(404).json({ message: `No requisition found with reference number ${req.body.reference_number}` });
        }

        console.log(req.body.vehicle_requested)
        res.status(200).json({ message: `Request updated successfully!`})

        //Log the request
        createLog({
            action: 'update',
            performed_by: req.body.requester,
            target: req.params.reference_number,
            title: 'Request Approved by Immediate Head',
            details: `Venue Requisition ${req.params.reference_number} ${req.params.approval_flag} by immediate head!`,
        })
    }catch(error){
        res.status(500).json({ message: `Encountered an internal error ${error}`, error});
    }
}


// Approval of GSO Director
export async function gsoDirectorApproval(req, res){
    try{
        const [updatedRow] = await PurchasingRequestModel.update({
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

        console.log(req.body.vehicle_requested)
        res.status(200).json({ message: `Request updated successfully!`})

        //Log the request
        createLog({
            action: 'update',
            performed_by: req.body.requester,
            target: req.params.reference_number,
            title: 'Request Approved by GSO Director',
            details: `Venue Requisition ${req.params.reference_number} ${req.params.approval_flag} by GSO Director!`,
        })
    }catch(error){
        res.status(500).json({ message: `Encountered an internal error ${error}`, error});
    }
}


// Approval of Operations Director
export async function operationsDirectorApproval(req, res){
    try{
        const [updatedRow] = await PurchasingRequestModel.update({
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

        console.log(req.body.vehicle_requested)
        res.status(200).json({ message: `Request updated successfully!`})

        //Log the request
        createLog({
            action: 'update',
            performed_by: req.body.requester,
            target: req.params.reference_number,
            title: 'Request Approved by Operations Director',
            details: `Venue Requisition ${req.params.reference_number} ${req.params.approval_flag} by operations head!`,
        })
    }catch(error){
        res.status(500).json({ message: `Encountered an internal error ${error}`, error});
    }
}


// Get Vehicle Request by Status
export async function getAllPurchasingRequestByStatus(req, res) {
    try{
        const requisitions = await PurchasingRequestModel.findAll({
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
