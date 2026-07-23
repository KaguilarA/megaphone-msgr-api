import { Router } from 'express';
import { renderContactsPage, renderNewContactPage } from '../controllers/ViewContact.ts';

const ViewContactRouter = Router();

ViewContactRouter.get('/', renderContactsPage);
ViewContactRouter.get('/new', renderNewContactPage);

export default ViewContactRouter;