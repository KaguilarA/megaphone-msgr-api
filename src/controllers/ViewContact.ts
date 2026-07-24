import type { Request, Response } from 'express';
import { Contact } from '../models/Contact.ts';

export const loadCountries = async (_req: Request, res: Response): Promise<void> => {
  try {
    const response = await fetch('https://countriesnow.space/api/v0.1/countries/codes');

    if (!response.ok) {
      throw new Error(`Error en API de países: ${response.status}`);
    }

    const result = await response.json();

    const countries = result.data
      .map((c: { name: string; code: string; dial_code: string }) => ({
        code: c.code,      // Ejemplo: 'CR', 'US', 'MX'
        idd: c.dial_code,  // Ejemplo: '+506', '+1', '+52'
      }))
      .filter((c: { idd: string; code: string }) => c.idd && c.code)
      .sort((a: { code: string }, b: { code: string }) => a.code.localeCompare(b.code));

    res.json(countries);
  } catch (error) {
    console.error('Error obteniendo países en Backend:', error);

    // Fallback limpio con solo abreviatura y código
    res.json([
      { code: 'CR', idd: '+506' },
      { code: 'US', idd: '+1' },
      { code: 'MX', idd: '+52' },
      { code: 'ES', idd: '+34' },
      { code: 'AR', idd: '+54' },
      { code: 'CO', idd: '+57' },
    ]);
  }
};

export const renderContactsPage = async (_req: Request, res: Response): Promise<void> => {
  try {
    const contacts = await Contact.find()
      .populate('phoneNumbers')
      .populate('emails')
      .populate('addresses') // Usar 'addresses' para matchear el ContactSchema
      .sort({ createdAt: -1 });

    res.render('contacts/index', { title: 'Contactos', contacts });
  } catch (error) {
    console.error('Error al renderizar la página de contactos:', error);
    res.status(500).send('Error al obtener los contactos de la base de datos');
  }
};

export const renderNewContactPage = (_req: Request, res: Response): void => {
  res.render('contacts/new', { title: 'Nuevo Contacto' });
};

export const renderEditContactView = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Buscar contacto y poblar todos sus subdocumentos
    const contact = await Contact.findById(id)
      .populate('phoneNumbers')
      .populate('emails')
      .populate('addresses');

    if (!contact) {
      res.status(404).send('Contacto no encontrado');
      return;
    }

    res.render('contacts/edit', {
      title: 'Editar Contacto',
      contact
    });
  } catch (error) {
    console.error('Error al cargar la vista de edición:', error);
    res.status(500).send('Error al cargar la vista de edición');
  }
};