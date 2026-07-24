import PhoneNumberModel from "./../../../db/models/phoneNumber.model.js";

export const createPhoneNumber = async (req, res) => {
  try {
    const savedPhoneNumber = await PhoneNumberModel.save(req.body);

    res.status(201).json(savedPhoneNumber);
  } catch (error) {
    res.status(400).json({
      message: 'Error al crear el número de teléfono',
      error: error.message
    });
  }
};

export const getPhoneNumbers = async (_req, res) => {
  try {
    const phoneNumbers = await PhoneNumberModel.getAll();
    res.status(200).json(phoneNumbers);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los números de teléfono',
      error: error.message
    });
  }
};

export const getPhoneNumberById = async (req, res) => {
  try {
    const { id } = req.params;
    const phoneNumber = await PhoneNumberModel.getById(id);

    if (!phoneNumber) {
      res.status(404).json({ message: 'Número de teléfono no encontrado' });
      return;
    }

    res.status(200).json(phoneNumber);
  } catch (error) {
    res.status(500).json({
      message: 'Error al buscar el número de teléfono',
      error: error.message
    });
  }
};

export const updatePhoneNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPhoneNumber = await PhoneNumberModel.update(id, req.body);

    if (!updatedPhoneNumber) {
      res.status(404).json({ message: 'Número de teléfono no encontrado' });
      return;
    }

    res.status(200).json(updatedPhoneNumber);
  } catch (error) {
    res.status(400).json({
      message: 'Error al actualizar el número de teléfono',
      error: error.message
    });
  }
};

export const deletePhoneNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPhoneNumber = await PhoneNumberModel.delete(id);

    if (!deletedPhoneNumber) {
      res.status(404).json({ message: 'Número de teléfono no encontrado' });
      return;
    }

    res.status(200).json({ message: 'Número de teléfono eliminado correctamente' });
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar el número de teléfono',
      error: error.message
    });
  }
};