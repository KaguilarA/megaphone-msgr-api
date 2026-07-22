import type { Request, Response } from 'express';

export const renderContactsPage = (_req: Request, res: Response): void => {
  res.render('contacts/contacts');
};