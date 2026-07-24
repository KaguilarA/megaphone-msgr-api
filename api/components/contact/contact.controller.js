import { Contact } from "./contact.model";

export const createContact = async (req, res) => {
  try {
    const { name, phoneNumbers, emails, addresses } = req.body;

    if (!name) {
      res.status(400).json({ message: 'El nombre del contacto es requerido' });
      return;
    }

    const newContact = new Contact({
      name,
      phoneNumbers: phoneNumbers || [],
      emails: emails || [],
      addresses: addresses || []
    });

    const savedContact = await newContact.save();

    res.status(201).json(savedContact);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el contacto', error: error.message || error });
  }
};

export const getContacts = async (_req, res) => {
  try {
    const contacts = await Contact.find()
      .populate('addresses')
      .populate('emails')
      .populate('phoneNumbers');

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los contactos', error: error.message || error });
  }
};

export const getContactById = async (req, res) => {
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
    res.status(500).json({ message: 'Error al buscar el contacto', error: error.message || error });
  }
};

export const updateContact = async (req, res) => {
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
    res.status(500).json({ message: 'Error al actualizar el contacto', error: error.message || error });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      res.status(404).json({ message: 'Contacto no encontrado' });
      return;
    }

    res.json({ message: 'Contacto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el contacto', error: error.message || error });
  }
};