import { Router } from 'express';
import {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress
} from '../controllers/Address.ts';

const AddressRouter = Router();

AddressRouter.post('/', createAddress);
AddressRouter.get('/', getAddresses);
AddressRouter.get('/:id', getAddressById);
AddressRouter.put('/:id', updateAddress);
AddressRouter.delete('/:id', deleteAddress);

export default AddressRouter;