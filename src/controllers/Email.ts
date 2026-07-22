import { Request, Response } from 'express';
import { Email } from '../models/Email.ts';

export const createEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const newEmail = new Email(req.body);
    const savedEmail = await newEmail.save();
    res.status(201).json(savedEmail);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el email', error });
  }
};

export const getEmails = async (_req: Request, res: Response): Promise<void> => {
  try {
    const emails = await Email.find();
    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los emails', error });
  }
};

export const getEmailById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const email = await Email.findById(id);

    if (!email) {
      res.status(404).json({ message: 'Email no encontrado' });
      return;
    }

    res.json(email);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar el email', error });
  }
};

export const updateEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedEmail = await Email.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedEmail) {
      res.status(404).json({ message: 'Email no encontrado' });
      return;
    }

    res.json(updatedEmail);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el email', error });
  }
};

export const deleteEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedEmail = await Email.findByIdAndDelete(id);

    if (!deletedEmail) {
      res.status(404).json({ message: 'Email no encontrado' });
      return;
    }

    res.json({ message: 'Email eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el email', error });
  }
};