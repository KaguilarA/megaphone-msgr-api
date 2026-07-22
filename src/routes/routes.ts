import { Router } from 'express';
import AddressRouter from './Address.ts';
import EmailRouter from './Email.ts';

const router = Router();

router.use('/address', AddressRouter);
router.use('/email', EmailRouter);

export default router;