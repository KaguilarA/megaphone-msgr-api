import { Router } from "express";
import {
  createPhoneNumber,
  getPhoneNumbers,
  getPhoneNumberById,
  updatePhoneNumber,
  deletePhoneNumber,
} from "./phoneNumber.controller";

const PhoneNumberRouter = Router();

PhoneNumberRouter.post('/', createPhoneNumber);
PhoneNumberRouter.get('/', getPhoneNumbers);
PhoneNumberRouter.get('/:id', getPhoneNumberById);
PhoneNumberRouter.put('/:id', updatePhoneNumber);
PhoneNumberRouter.delete('/:id', deletePhoneNumber);

export default PhoneNumberRouter;