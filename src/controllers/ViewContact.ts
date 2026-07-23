import type { Request, Response } from 'express';

export const renderContactsPage = (_req: Request, res: Response): void => {
  res.render('contacts/index');
};

export const renderNewContactPage = (_req: Request, res: Response): void => {
  res.render('contacts/new');
};