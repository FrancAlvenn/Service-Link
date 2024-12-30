import sequelize from "../database.js";
import { JobRequestModel, JobRequestDetails } from '../models/index.js';
import { Op } from 'sequelize';
import { createLog } from "./system_logs.js";

// Generate a unique reference number (e.g., DYCI-2024-0001)
function generateReferenceNumber(lastRequestId) {
    const year = new Date().getFullYear();
    const uniqueNumber = String(lastRequestId + 1).padStart(5, '0');
    return `JR-${year}-${uniqueNumber}`;
};

// Create Vehicle Requests
export async function createJobRequest(req, res){
    let transaction;
    try {
        transaction = await sequelize.transaction();

        // Generate a unique reference number
        const lastRequest = await JobRequestModel.findOne({ order: [['id', 'DESC']] });
        const referenceNumber = generateReferenceNumber(lastRequest ? lastRequest.id : 0);


        const newJobRequest = await JobRequestModel.create({
          reference_number : referenceNumber,
          date_required : req.body.date_required,
          department: req.body.department,
          purpose : req.body.purpose,
          requester_id : req.body.requester_id,
          status : req.body.status,
          immediate_head_approval : req.body.immediate_head_approval,
          gso_director_approval : req.body.gso_director_approval,
          operations_director_approval : req.body.operations_director_approval,
          archived : req.body.archived || false,
          remarks : req.body.remarks || null,
        }, { transaction });

        const detailsData = req.body.details.map(detail => ({
          job_request_id: newJobRequest.reference_number,
          quantity: detail.quantity || null,
          particulars: detail.particulars,
          description: detail.description,
          remarks: detail.remarks || null
        }));

        await JobRequestDetails.bulkCreate(detailsData, { transaction });

        await transaction.commit();

        createLog({
          action: 'Created new job request',
          target: referenceNumber,
          performed_by: req.body.requester_id,
          title: 'Request Submitted',
          details: `Job Request with reference number ${referenceNumber} created successfully!`
        });

        res.status(201).json({message: `Job request created successfully!`});
    
      } catch (error) {
        // Rollback the transaction in case of error
        if (transaction) {
          await transaction.rollback();
        }
        console.error(error);
        res.status(500).json({message: 'Error creating job request', error: error.message,});
      }
}

// Get All Vehicle Requests
export async function getAllJobRequest(req, res) {
    try{
        const jobRequest = await JobRequestModel.findAll({
            where: {
                archived: {
                    [Op.eq]: false
                }
             },
            include: [
                {
                    model: JobRequestDetails,
                    as: 'details'
                }
            ],
        });



        if (jobRequest === null) {
            res.status(404).json({message : 'Request not found!'});
        } else {
            res.status(200).json(jobRequest);
        }
    }catch (error) {
        res.status(500).json({ message: `Error fetching vehicle requisitions`, error });
    }
}


// Get Vehicle Request by ID
export async function getJobRequestById(req, res) {
    try{
        const jobRequest = await JobRequestModel.findOne({
            where: { reference_number: req.params.reference_number },
            include: [{ model: JobRequestDetails, as: 'details' }],
          });

        console.log(req.params.reference_number)
        if (jobRequest === null) {
            res.status(404).json({message : 'Request not found!'});
        } else {
            res.status(200).json(jobRequest);
        }
    }catch (error) {
        res.status(500).json({ message: `Error fetching vehicle requisitions`, error });
    }
}

// Update Vehicle Request
export async function updateJobRequest(req, res) {
    let transaction;
    try {
        transaction = await sequelize.transaction();

        const [updatedRows] = await JobRequestModel.update(
            {
            date_required: req.body.date_required,
            purpose: req.body.purpose,
            requester_id: req.body.requester_id,
            department: req.body.department,
            status: req.body.status,
            immediate_head_approval: req.body.immediate_head_approval,
            gso_director_approval: req.body.gso_director_approval,
            operations_director_approval: req.body.operations_director_approval,
            archived: req.body.archived,
            remarks : req.body.remarks || null,
            },
            {
            where: {
                reference_number:
                req.params.reference_number,
            },
            transaction,
            }
        );

        if (updatedRows === 0) {
            return res.status(404).json({
                message: `No job request found with reference number ${req.params.reference_number}`,
            });
        }

        //Get the IDs of the current details in the database
        const existingDetails = await JobRequestDetails.findAll({
        where: { job_request_id: req.params.reference_number },
        attributes: ['id'],
        transaction,
        });

        const existingDetailIds = existingDetails.map((detail) => detail.id);

        // Extract IDs from incoming data
        const incomingDetailIds = req.body.details
        .filter((detail) => detail.id) // Only include those with IDs
        .map((detail) => detail.id);

        // Delete details that are no longer in the request body
        const detailsToDelete = existingDetailIds.filter(
        (id) => !incomingDetailIds.includes(id)
        );

        if (detailsToDelete.length > 0) {
        await JobRequestDetails.destroy({
            where: { id: detailsToDelete },
            transaction,
        });
        }

        //If detail has id then update, else if its a new detail then create
        for (const detail of req.body.details) {
        if (detail.id) {
            // Update existing detail
            await JobRequestDetails.update(
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
            // Create new detail
            await JobRequestDetails.create(
            {
                job_request_id: req.params.reference_number,
                quantity: detail.quantity || null,
                particulars: detail.particulars,
                description: detail.description,
                remarks: detail.remarks || null,
            },
            { transaction }
            );
        }
        }
    
        // Commit transaction
        await transaction.commit();

        // Log the update action
        createLog({
        action: 'update',
        performed_by: req.body.requester_id,
        target: req.params.reference_number,
        title: 'Request Updated',
        details: `Job Request ${req.params.reference_number} updated successfully!`,
        });

        //Success Message
        res.status(200).json({ message: `Job request updated successfully!` });

    } catch (error) {
        // Rollback the transaction in case of error
        if (transaction) await transaction.rollback();

        console.error(error);
        res.status(500).json({ message: `Encountered an internal error: ${error.message}` });
    }
}
  

// Delete / Archive Request
export async function archiveById(req, res){
    try{
        const [updatedRows] = await JobRequestModel.update({
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

        console.log(req.body.vehicle_requested)
        res.status(200).json({ message: req.params.archive === '0' ? 'Request removed from archive!' : 'Request added to archive!'});

        //Log the request
        createLog({
            action: 'archive',
            performed_by: req.body.requester_id,
            target: req.params.reference_number,
            title: 'Request Archived',
            details: `Vehicle Requisition ${req.params.reference_number} archived successfully!`,
        });
    }catch(error){
        res.status(500).json({ message: `Encountered an internal error ${error}`, error: error});
    }
}


// Approval of Immediate Head
export async function immediateHeadApproval(req, res){
    try{
        const [updatedRow] = await JobRequestModel.update({
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
            performed_by: req.body.requester_id,
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
        const [updatedRow] = await JobRequestModel.update({
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
            performed_by: req.body.requester_id,
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
        const [updatedRow] = await JobRequestModel.update({
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
            performed_by: req.body.requester_id,
            target: req.params.reference_number,
            title: 'Request Approved by Operations Director',
            details: `Venue Requisition ${req.params.reference_number} ${req.params.approval_flag} by operations head!`,
        })
    }catch(error){
        res.status(500).json({ message: `Encountered an internal error ${error}`, error});
    }
}


// Get Vehicle Request by Status
export async function getAllJobRequestByStatus(req, res) {
    try{
        const requisitions = await JobRequestModel.findAll({
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


