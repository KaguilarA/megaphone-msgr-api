import { Router } from 'express';
import { renderContactsPage } from '../controllers/ViewContact.ts';

const ViewRouter = Router();

ViewRouter.get('/contacts', renderContactsPage);

export default ViewRouter;