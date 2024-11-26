import express from 'express';
import { createNewDepartment, getAllDepartments, getDepartmentById, updateDepartment, archiveDepartmentById } from '../controllers/settings_controllers/department.js';
import { createNewOrganization, getAllOrganizations, getOrganizationById, updateOrganization, archiveOrganizationById  } from '../controllers/settings_controllers/organization.js';
import { createNewStatus, getAllStatus, getStatusById, updateStatus, archiveStatusById } from '../controllers/settings_controllers/status.js';
import { createNewPriority, getAllPriority, getPriorityById, updatePriority, archivePriorityById } from '../controllers/settings_controllers/priority_level.js';

const router = express.Router();


//ROUTE FOR DEPARTMENTS

//Create a new department
router.post('/department', createNewDepartment);

//Get all departments
router.get('/department', getAllDepartments);

//Get departments by ID
router.get('/department/:id', getDepartmentById);

//Edit a department
router.put('/department/:id', updateDepartment);

//Delete a department
router.delete('/department/:id/archive/:archive', archiveDepartmentById);




//ROUTE FOR ORGANIZATIONS

//Create a new organization
router.post('/organization', createNewOrganization);

//Get all organizations
router.get('/organization', getAllOrganizations);

//Get organizations by ID
router.get('/organization/:id', getOrganizationById);

//Edit a organization
router.put('/organization/:id', updateOrganization);

//Delete a organization
router.delete('/organization/:id/archive/:archive', archiveOrganizationById);




//ROUTE FOR STATUS

//Create a new status
router.post('/status', createNewStatus);

//Get all status
router.get('/status', getAllStatus);

//Get status by ID
router.get('/status/:id', getStatusById);

//Edit a status
router.put('/status/:id', updateStatus);

//Delete a status
router.delete('/status/:id/archive/:archive', archiveStatusById);


//ROUTE FOR PRIORITY

//Create a new priority
router.post('/priority', createNewPriority);

//Get all priority
router.get('/priority', getAllPriority);

//Get priority by ID
router.get('/priority/:id', getPriorityById);

//Edit a priority
router.put('/priority/:id', updatePriority);

//Delete a priority
router.delete('/priority/:id/archive/:archive', archivePriorityById);



export default router;