import sequelize from "../database.js";
import { VehicleRequestModel } from "../models/index.js";
import { Op } from "sequelize";
import { createLog } from "./system_logs.js";
import User from "../models/UserModel.js";

// Generate a unique reference number (e.g., DYCI-2024-0001)
function generateReferenceNumber(lastRequestId) {
  const year = new Date().getFullYear();
  const uniqueNumber = String(lastRequestId + 1).padStart(5, "0");
  return `SV-${year}-${uniqueNumber}`;
}

// Create Vehicle Requests
export async function createVehicleRequest(req, res) {
  try {
    // Generate a unique reference number
    const lastRequest = await VehicleRequestModel.findOne({
      order: [["id", "DESC"]],
    });
    const referenceNumber = generateReferenceNumber(
      lastRequest ? lastRequest.id : 0
    );

    // Create the vehicle requisition entry in the database
    const newVehicleRequisition = await VehicleRequestModel.create({
      reference_number: referenceNumber,
      title: req.body.title,
      vehicle_requested: req.body.vehicle_requested,
      date_filled: req.body.date_filled,
      date_of_trip: req.body.date_of_trip,
      time_of_departure: req.body.time_of_departure,
      time_of_arrival: req.body.time_of_arrival,
      number_of_passengers: req.body.number_of_passengers,
      destination: req.body.destination,
      destination_coordinates: req.body.destination_coordinates,
      purpose: req.body.purpose,
      requester: req.body.requester,
      status: "Pending",
      vehicle_id: req.body.vehicle_id,
      remarks: req.body.remarks,
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      authorized_access: [req.body.requester],
      approvers: [req.body.approvers],
    });

    res.status(201).json({ message: `Request created successfully!` });

    //Log the request
    createLog({
      action: "create",
      performed_by: req.body.requester,
      target: referenceNumber,
      type: "Request Submitted",
      details: `Vehicle Requisition ${referenceNumber} created successfully!`,
    });
  } catch (error) {
    res.status(500).json({ message: `Encountered an internal error ${error}` });
  }
}

// Get All Vehicle Requests
export async function getAllVehicleRequest(req, res) {
  try {
    const requisitions = await VehicleRequestModel.findAll({
      where: {
        archived: {
          [Op.eq]: false, // Get all that is not archived
        },
      },
      include: [
        {
          model: User,
          as: "requester_details",
        },
      ],
    });
    if (!requisitions || requisitions.length === 0) {
      res.status(200).json({ message: "No vehicle requests found!" });
    } else {
      res.status(200).json(requisitions);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching vehicle requisitions`, error });
  }
}

// Get All Archived Vehicle Requests
export async function getAllArchivedVehicleRequest(req, res) {
  try {
    const requisitions = await VehicleRequestModel.findAll({
      where: {
        archived: {
          [Op.eq]: true, // Get all that is not archived
        },
      },
      include: [
        {
          model: User,
          as: "requester_details",
        },
      ],
    });
    if (!requisitions || requisitions.length === 0) {
      res.status(200).json({ message: "No vehicle requests found!" });
    } else {
      res.status(200).json(requisitions);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching vehicle requisitions`, error });
  }
}

// Get Vehicle Request by ID
export async function getVehicleRequestById(req, res) {
  try {
    const requisition = await VehicleRequestModel.findOne({
      where: {
        reference_number: req.params.reference_number,
      },
      archived: {
        [Op.eq]: false, // Get all that is not archived
      },
      include: [
        {
          model: User,
          as: "requester_details",
        },
      ],
    });
    console.log(req.params.reference_number);
    if (requisition === null) {
      res.status(404).json({ message: "Request not found!" });
    } else {
      res.status(200).json({ requisition });
      console.log(requisition.title);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching vehicle requisitions`, error });
  }
}

// Update Vehicle Request
export async function updateVehicleRequest(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const { reference_number } = req.params;
    const updateData = { ...req.body }; // Only update provided fields

    const [updatedRows] = await VehicleRequestModel.update(updateData, {
      where: { reference_number },
      transaction,
    });

    // If no rows were updated, return 404
    if (updatedRows === 0) {
      await transaction.rollback();
      return res.status(404).json({
        message: `No requisition found with reference number ${reference_number}`,
      });
    }

    await transaction.commit();

    // Log the update
    createLog({
      action: "update",
      performed_by: req.body.requester,
      target: reference_number,
      title: "Request Updated",
      details: `Vehicle Requisition ${reference_number} updated successfully!`,
    });

    res.status(200).json({ message: `Request updated successfully!` });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: `Encountered an internal error`, error });
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
    const [updatedRow] = await VehicleRequestModel.update(
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
      action: "update",
      performed_by: req.body.requester,
      target: req.params.reference_number,
      title: "Request Status Updated",
      details: `Request ${req.params.reference_number} status updated to "${status}"`,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: `Error updating job request status`, error });
  }
}

// Delete / Archive Request
export async function archiveById(req, res) {
  try {
    const [updatedRows] = await VehicleRequestModel.update(
      {
        archived: req.params.archive,
      },
      {
        where: {
          reference_number: req.params.reference_number,
        },
      }
    );

    // If no rows were updated, it means the reference number didn't match any requisition
    if (updatedRows === 0) {
      return res.status(404).json({
        message: `No requisition found with reference number ${req.body.reference_number}`,
      });
    }

    console.log(req.body.vehicle_requested);
    res.status(200).json({
      message:
        req.params.archive === "0"
          ? "Request removed from archive!"
          : "Request added to archive!",
    });

    //Log the request
    createLog({
      action: "archive",
      performed_by: req.body.requester,
      target: req.params.reference_number,
      title: "Request Archived",
      details: `Vehicle Requisition ${req.params.reference_number} archived successfully!`,
    });
  } catch (error) {
    res.status(500).json({
      message: `Encountered an internal error ${error}`,
      error: error,
    });
  }
}

// Approval of Immediate Head
export async function immediateHeadApproval(req, res) {
  try {
    const [updatedRow] = await VehicleRequestModel.update(
      {
        immediate_head_approval: req.params.approval_flag,
      },
      {
        where: {
          reference_number: req.params.reference_number,
        },
      }
    );

    // If no rows were updated, it means the reference number didn't match any requisition
    if (updatedRow === 0) {
      return res.status(404).json({
        message: `No requisition found with reference number ${req.body.reference_number}`,
      });
    }

    console.log(req.body.vehicle_requested);
    res.status(200).json({ message: `Request updated successfully!` });

    //Log the request
    createLog({
      action: "update",
      performed_by: req.body.requester,
      target: req.params.reference_number,
      title: "Request Approved by Immediate Head",
      details: `Venue Requisition ${req.params.reference_number} ${req.params.approval_flag} by immediate head!`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Encountered an internal error ${error}`, error });
  }
}

// Approval of GSO Director
export async function gsoDirectorApproval(req, res) {
  try {
    const [updatedRow] = await VehicleRequestModel.update(
      {
        gso_director_approval: req.params.approval_flag,
      },
      {
        where: {
          reference_number: req.params.reference_number,
        },
      }
    );

    // If no rows were updated, it means the reference number didn't match any requisition
    if (updatedRow === 0) {
      return res.status(404).json({
        message: `No requisition found with reference number ${req.body.reference_number}`,
      });
    }

    console.log(req.body.vehicle_requested);
    res.status(200).json({ message: `Request updated successfully!` });

    //Log the request
    createLog({
      action: "update",
      performed_by: req.body.requester,
      target: req.params.reference_number,
      title: "Request Approved by GSO Director",
      details: `Venue Requisition ${req.params.reference_number} ${req.params.approval_flag} by GSO Director!`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Encountered an internal error ${error}`, error });
  }
}

// Approval of Operations Director
export async function operationsDirectorApproval(req, res) {
  try {
    const [updatedRow] = await VehicleRequestModel.update(
      {
        operations_director_approval: req.params.approval_flag,
      },
      {
        where: {
          reference_number: req.params.reference_number,
        },
      }
    );

    // If no rows were updated, it means the reference number didn't match any requisition
    if (updatedRow === 0) {
      return res.status(404).json({
        message: `No requisition found with reference number ${req.body.reference_number}`,
      });
    }

    console.log(req.body.vehicle_requested);
    res.status(200).json({ message: `Request updated successfully!` });

    //Log the request
    createLog({
      action: "update",
      performed_by: req.body.requester,
      target: req.params.reference_number,
      title: "Request Approved by Operations Director",
      details: `Venue Requisition ${req.params.reference_number} ${req.params.approval_flag} by operations head!`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Encountered an internal error ${error}`, error });
  }
}

// Get Vehicle Request by Status
export async function getAllVehicleRequestByStatus(req, res) {
  try {
    const requisitions = await VehicleRequestModel.findAll({
      where: {
        status: req.params.status,
      },
      archived: {
        [Op.eq]: false, // Get all that is not archived
      },
    });
    console.log(req.params.status);
    if (requisitions === null) {
      res.status(404).json({
        message: `No request with the status - ${req.params.status}!`,
      });
    } else {
      res.status(200).json({ message: requisitions });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching vehicle requisitions`, error });
  }
}

// Get Vehicle Request by Date of Trip using custom SQL
export async function getVehicleRequestByTrip(req, res) {
  try {
    const { date_of_trip } = req.params;

    const [requisitions, metadata] = await sequelize.query(
      `SELECT * FROM vehicle_requisition WHERE DATE(date_of_trip) = :date_of_trip AND archived = false`,
      {
        replacements: { date_of_trip },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Check if any records were found
    if (!requisitions || requisitions.length === 0) {
      res.status(404).json({ message: "Request not found!" });
    } else {
      res.status(200).json({ requisitions });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: `Encountered an internal error ${error}`, error });
  }
}
