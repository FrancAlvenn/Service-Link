import sequelize from "../database.js";
import LogsModel from "../models/SystemLogs.js";
import { Op } from 'sequelize';


function generateReferenceNumber(lastRequestId) {
    const year = new Date().getFullYear();
    const uniqueNumber = String(lastRequestId + 1);
    return `SYSLOG-${year}-${uniqueNumber}`;
};

export async function getAllLogs(req, res) {
    try {
        const logs = await LogsModel.findAll({
            where: {
                archived : {
                    [Op.eq]: false // Get all that is not archived
                }
            }
        });
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: `Error fetching system logs`, error });
    }
}

export async function getLogById(req, res) {
    try {
        const log = await LogsModel.findOne({
            where: {
                id: req.params.id,
                archived : {
                    [Op.eq]: false // Get all that is not archived
                }
            }
        });
        res.status(200).json(log);
    } catch (error) {
        res.status(500).json({ message: `Error fetching system logs`, error });
    }
}


export async function createLog(logData) {
    try {
        // Generate a unique reference number
        const lastRequest = await LogsModel.findOne({ order: [['id', 'DESC']] });
        const referenceNumber = generateReferenceNumber(lastRequest ? lastRequest.id : 0);

        const newLog = await LogsModel.create({
            reference_number: referenceNumber,
            action: logData.action,
            performed_by: logData.performed_by,
            target: logData.target,
            details: logData.details
        });

        console.log('Log created successfully!');
    } catch (error) {
        console.error(`Encountered an internal error while creating log: ${error}`);
    }
}