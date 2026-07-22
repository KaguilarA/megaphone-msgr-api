import { Router } from 'express';
import {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact
} from '../controllers/Contact.ts';

const ContactRouter = Router();

ContactRouter.post('/', createContact);
ContactRouter.get('/', getContacts);
ContactRouter.get('/:id', getContactById);
ContactRouter.put('/:id', updateContact);
ContactRouter.delete('/:id', deleteContact);

export default ContactRouter;