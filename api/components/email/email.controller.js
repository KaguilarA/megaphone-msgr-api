import EmailModel from "./../../../db/models/email.model.js";

export const createEmail = async (req, res) => {
  try {
    const savedEmail = await EmailModel.save(req.body);
    res.status(201).json(savedEmail);
  } catch (error) {
    res.status(400).json({
      message: 'Error al crear el email',
      error: error.message
    });
  }
};

export const getEmails = async (_req, res) => {
  try {
    const emails = await EmailModel.find();
    res.status(200).json(emails);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los emails',
      error: error.message
    });
  }
};

export const getEmailById = async (req, res) => {
  try {
    const { id } = req.params;
    const email = await EmailModel.findById(id);

    if (!email) {
      res.status(404).json({ message: 'Email no encontrado' });
      return;
    }

    res.status(200).json(email);
  } catch (error) {
    res.status(500).json({
      message: 'Error al buscar el email',
      error: error.message
    });
  }
};

export const updateEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEmail = await EmailModel.update(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedEmail) {
      res.status(404).json({ message: 'Email no encontrado' });
      return;
    }

    res.status(200).json(updatedEmail);
  } catch (error) {
    res.status(400).json({
      message: 'Error al actualizar el email',
      error: error.message
    });
  }
};

export const deleteEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEmail = await EmailModel.delete(id);

    if (!deletedEmail) {
      res.status(404).json({ message: 'Email no encontrado' });
      return;
    }

    res.status(200).json({ message: 'Email eliminado correctamente' });
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar el email',
      error: error.message
    });
  }
};