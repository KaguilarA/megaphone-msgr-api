import { Router } from 'express';
import AddressRouter from './Address.ts';
import ContactRouter from './Contact.ts';
import EmailRouter from './Email.ts';
import PhoneNumberRouter from './PhoneNumber.ts';

const router = Router();

router.use('/address', AddressRouter);
router.use('/contact', ContactRouter);
router.use('/email', EmailRouter);
router.use('/phone-number', PhoneNumberRouter);

export default router;