import { Router } from 'express';
import {
  createPhoneNumber,
  getPhoneNumbers,
  getPhoneNumberById,
  updatePhoneNumber,
  deletePhoneNumber
} from '../controllers/PhoneNumber.ts';

const PhoneNumberRouter = Router();

PhoneNumberRouter.post('/', createPhoneNumber);
PhoneNumberRouter.get('/', getPhoneNumbers);
PhoneNumberRouter.get('/:id', getPhoneNumberById);
PhoneNumberRouter.put('/:id', updatePhoneNumber);
PhoneNumberRouter.delete('/:id', deletePhoneNumber);

export default PhoneNumberRouter;