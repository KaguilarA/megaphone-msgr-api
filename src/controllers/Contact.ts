import type { Request, Response } from 'express';
import { Contact } from '../models/Contact.ts';

export const createContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phoneNumbers, email, emails, idEmail, addresses, idAddress } = req.body;

    if (!name) {
      res.status(400).json({ message: 'El nombre del contacto es requerido' });
      return;
    }

    // Normalizar los correos enviados (acepta email, emails o idEmail)
    const resolvedEmails = emails || email || idEmail || [];
    const resolvedAddresses = addresses || idAddress || [];

    const newContact = new Contact({
      name,
      phoneNumbers: phoneNumbers || [],
      email: resolvedEmails, // o 'emails' según la definición de tu ContactSchema
      idAddress: resolvedAddresses
    });

    const savedContact = await newContact.save();

    res.status(201).json(savedContact);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al crear el contacto', error: error.message || error });
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