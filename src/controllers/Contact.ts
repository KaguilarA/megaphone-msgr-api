import type { Request, Response } from 'express';
import { Contact } from '../models/Contact.ts';

export const createContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const newContact = new Contact(req.body);
    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el contacto', error });
  }
};

export const getContacts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const contacts = await Contact.find()
      .populate('addresses')
      .populate('emails')
      .populate('phoneNumbers');

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los contactos', error });
  }
};

export const getContactById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id)
      .populate('addresses')
      .populate('emails')
      .populate('phoneNumbers');

    if (!contact) {
      res.status(404).json({ message: 'Contacto no encontrado' });
      return;
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar el contacto', error });
  }
};

export const updateContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedContact = await Contact.findByIdAndUpdate(id, req.body, { new: true })
      .populate('addresses')
      .populate('emails')
      .populate('phoneNumbers');

    if (!updatedContact) {
      res.status(404).json({ message: 'Contacto no encontrado' });
      return;
    }

    res.json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el contacto', error });
  }
};

export const deleteContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      res.status(404).json({ message: 'Contacto no encontrado' });
      return;
    }

    res.json({ message: 'Contacto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el contacto', error });
  }
};