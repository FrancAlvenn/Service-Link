import sequelize from "../../database.js";
import PriorityModel from '../../models/SettingsModels/PriorityModel.js'
import { Op } from 'sequelize';


export async function createNewPriority(req, res){
    try{
        const newPriority = await PriorityModel.create({
            priority: req.body.priority,
        })

        res.status(201).json({message: `Priority added successfully!`});
    }catch(error){
        res.status(500).json({ message: `Encountered an internal error ${error}` });
    }
}


export async function getAllPriority(req, res){
    try{
        const priority = await PriorityModel.findAll({
            where: {
                archived : {
                    [Op.eq]: false // Get all that is not archived
                }
            }
        })
        res.status(201).json({priority , message: `Priority data fetched successfully!`});
    }catch(error){
        res.status(500).json({ message: `Encountered an internal error ${error}` });
    }
}


export async function getPriorityById(req, res){
    try{
        const priority = await PriorityModel.findAll({
            where: {
                id: req.params.id,
                },
                archived : {
                    [Op.eq]: false // Get all that is not archived
                }
        })
        res.status(201).json({priority , message: `Priority data fetched successfully!`});
    }catch(error){
        res.status(500).json({ message: `Encountered an internal error ${error}` });
    }
}


export async function updatePriority(req, res){
    try{
        const [updatedRows] = await PriorityModel.update({
            priority: req.body.priority
        },
        {
            where: {
                id : req.params.id
            },
        })

        // If no rows were updated, it means the reference number didn't match any requisition
        if (updatedRows === 0) {
            return res.status(404).json({ message: `No priority found with id ${req.params.id}` });
        }

        res.status(200).json({ message: `Priority updated successfully!`})
    }catch (error){
        res.status(500).json({ message: `Encountered an internal error ${error}`})
    }
}


export async function archivePriorityById(req, res){
    try{
        const [updatedRows] = await PriorityModel.update({
            archived: req.params.archive
        },{
            where: {
                id :  req.params.id
            },
        })

        // If no rows were updated, it means the reference number didn't match any requisition
        if (updatedRows === 0) {
            return res.status(404).json({ message: `No priority found with reference number ${req.params.id}` });
        }

        res.status(200).json({ message: req.params.archive === '0' ? 'Priority removed from archive!' : 'Priority added to archive!'});
    }catch(error){
        res.status(500).json({ message: `Encountered an internal error ${error}`, error: error});
    }
}