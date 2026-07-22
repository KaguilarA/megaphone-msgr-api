import type { Request, Response } from 'express';
import { PhoneNumber } from '../models/PhoneNumber.ts';

export const createPhoneNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const newPhoneNumber = new PhoneNumber(req.body);
    const savedPhoneNumber = await newPhoneNumber.save();
    res.status(201).json(savedPhoneNumber);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el número de teléfono', error });
  }
};

export const getPhoneNumbers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const phoneNumbers = await PhoneNumber.find();
    res.json(phoneNumbers);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los números de teléfono', error });
  }
};

export const getPhoneNumberById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const phoneNumber = await PhoneNumber.findById(id);

    if (!phoneNumber) {
      res.status(404).json({ message: 'Número de teléfono no encontrado' });
      return;
    }

    res.json(phoneNumber);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar el número de teléfono', error });
  }
};

export const updatePhoneNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedPhoneNumber = await PhoneNumber.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedPhoneNumber) {
      res.status(404).json({ message: 'Número de teléfono no encontrado' });
      return;
    }

    res.json(updatedPhoneNumber);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el número de teléfono', error });
  }
};

export const deletePhoneNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedPhoneNumber = await PhoneNumber.findByIdAndDelete(id);

    if (!deletedPhoneNumber) {
      res.status(404).json({ message: 'Número de teléfono no encontrado' });
      return;
    }

    res.json({ message: 'Número de teléfono eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el número de teléfono', error });
  }
};