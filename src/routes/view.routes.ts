import { Router } from 'express';
import ViewContactRouter from './ViewContact.ts';

const ViewRouter = Router();

ViewRouter.use('/contacts', ViewContactRouter);

export default ViewRouter;