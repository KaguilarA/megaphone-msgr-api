import ContactModel from "./../../../db/models/contact.model.js";

const POPULATE_FIELDS = ["addresses", "emails", "phoneNumbers"];

export const createContact = async (req, res) => {
  try {
    const { name, phoneNumbers, emails, addresses } = req.body;

    if (!name) {
      res.status(400).json({ message: "El nombre del contacto es requerido" });
      return;
    }

    const savedContact = await ContactModel.save({
      name,
      phoneNumbers: phoneNumbers || [],
      emails: emails || [],
      addresses: addresses || [],
    });

    res.status(201).json(savedContact);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al crear el contacto",
        error: error.message || error,
      });
  }
};

export const getContacts = async (_req, res) => {
  try {
    const contacts = await ContactModel.getAll({ populate: POPULATE_FIELDS });
    res.json(contacts);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al obtener los contactos",
        error: error.message || error,
      });
  }
};

export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await ContactModel.getById(id, {
      populate: POPULATE_FIELDS,
    });

    if (!contact) {
      res.status(404).json({ message: "Contacto no encontrado" });
      return;
    }

    res.json(contact);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al buscar el contacto",
        error: error.message || error,
      });
  }
};

export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedContact = await ContactModel.update(id, req.body, {
      populate: POPULATE_FIELDS,
    });

    if (!updatedContact) {
      res.status(404).json({ message: "Contacto no encontrado" });
      return;
    }

    res.json(updatedContact);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al actualizar el contacto",
        error: error.message || error,
      });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedContact = await ContactModel.delete(id);

    if (!deletedContact) {
      res.status(404).json({ message: "Contacto no encontrado" });
      return;
    }

    res.json({ message: "Contacto eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al eliminar el contacto",
        error: error.message || error,
      });
  }
};
