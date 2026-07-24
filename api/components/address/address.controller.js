import AddressModel from "./../../../db/models/address.model.js";

export const createAddress = async (req, res) => {
  try {
    const savedAddress = await AddressModel.save(req.body);
    res.status(201).json(savedAddress);
  } catch (error) {
    res.status(400).json({
      message: 'Error al crear la dirección.',
      error: error.message
    });
  }
};

export const getAddresses = async (_req, res) => {
  try {
    const addresses = await AddressModel.getAll();
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener las direcciones.',
      error: error.message
    });
  }
};

export const getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await AddressModel.getById(id);

    if (!address) {
      res.status(404).json({ message: 'Dirección no encontrada.' });
      return;
    }

    res.status(200).json(address);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener la dirección.',
      error: error.message
    });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAddress = await AddressModel.update(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedAddress) {
      res.status(404).json({ message: 'Dirección no encontrada.' });
      return;
    }

    res.status(200).json(updatedAddress);
  } catch (error) {
    res.status(400).json({
      message: 'Error al actualizar la dirección.',
      error: error.message
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAddress = await AddressModel.delete(id);

    if (!deletedAddress) {
      res.status(404).json({ message: 'Dirección no encontrada.' });
      return;
    }

    res.status(200).json({ message: 'Dirección eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar la dirección.',
      error: error.message
    });
  }
};