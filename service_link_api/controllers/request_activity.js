import sequelize from "../database.js";
import RequestActivityModel from "../models/RequestActivity.js";
import { Op } from "sequelize";
import { createLog } from "./system_logs.js";

// Create a new request activity
export async function createRequestActivity(req, res) {
    let transaction;
    try {
        transaction = await sequelize.transaction();

        const newActivity = await RequestActivityModel.create({
            request_id: req.body.reference_number,
            visibility: req.body.visibility,
            request_type: req.body.type || "comment",
            action: req.body.action,
            details: req.body.details,
            created_by: req.body.performed_by,
        }, { transaction });
 
        await transaction.commit();

        await createLog({
            action: "create",
            performed_by: req.body.performed_by,
            target: req.body.reference_number,
            title: "New Activity Logged",
            details: `Activity recorded for request ${req.body.reference_number}: ${req.body.action}`,
        });

        res.status(201).json({ message: "Activity recorded successfully!", activity: newActivity });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error(error);
        res.status(500).json({ message: "Error creating request activity", error: error.message });
    }
}

// Get all activities for a specific request
export async function getRequestActivities(req, res) {
    try {
        const activities = await RequestActivityModel.findAll({
            where: { request_id: req.params.request_id }, // Fixed field name
            order: [["created_at", "DESC"]],
        });

        if (!activities.length) {
            return res.status(200).json({ message: "No activities found for this request." });
        }

        res.status(200).json(activities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching request activities", error });
    }
}

// Update a specific activity
export async function updateRequestActivity(req, res) {
    let transaction;
    try {
        transaction = await sequelize.transaction();

        const [updatedRows] = await RequestActivityModel.update(req.body, {
            where: { id: req.params.activity_id },
            transaction,
        });

        if (updatedRows === 0) {
            return res.status(404).json({ message: "No activity found with the given ID." });
        }

        await transaction.commit();

        await createLog({
            action: "update",
            performed_by: req.body.performed_by,
            target: req.params.activity_id,
            title: "Request Activity Updated",
            details: `Activity ${req.params.activity_id} was updated.`,
        });

        res.status(200).json({ message: "Activity updated successfully!" });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error(error);
        res.status(500).json({ message: "Error updating request activity", error });
    }
}

// Delete a specific activity log
export async function deleteRequestActivity(req, res) {
    let transaction;
    try {
        transaction = await sequelize.transaction();

        const deletedRow = await RequestActivityModel.destroy({
            where: { id: req.params.activity_id },
            transaction,
        });

        if (deletedRow === 0) {
            return res.status(404).json({ message: "Activity not found!" });
        }

        await transaction.commit();

        res.status(200).json({ message: "Activity deleted successfully!" });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error(error);
        res.status(500).json({ message: "Error deleting request activity", error });
    }
}
