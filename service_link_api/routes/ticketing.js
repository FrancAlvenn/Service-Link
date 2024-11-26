import express from 'express';
import { getAllTicket, getTicketById, createTicket, updateTicket, archiveById,} from '../controllers/ticketing.js';

const router = express.Router();

//Create a new Request
router.post('/', createTicket)

//Get all Vehicle Request
router.get("/", getAllTicket);

//Get Vehicle Request by Id
router.get("/:ticket_id", getTicketById)

//Update a Request by its ID
router.put('/:ticket_id', updateTicket)

//Delete/Archive by Id
router.delete("/:ticket_id/archive/:archive", archiveById)


export default router;