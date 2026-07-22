import type { Request, Response } from 'express';
import { Address } from '../models/Address.ts';

export const createAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const newAddress = new Address(req.body);
    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    res.status(400).json({
      message: 'Error al crear la dirección.',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const getAddresses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const addresses = await Address.find();
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener las direcciones.',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const getAddressById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const address = await Address.findById(id);

    if (!address) {
      res.status(404).json({ message: 'Dirección no encontrada.' });
      return;
    }

    res.status(200).json(address);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener la dirección.',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedAddress = await Address.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedAddress) {
      res.status(404).json({ message: 'Dirección no encontrada.' });
      return;
    }

    res.status(200).json(updatedAddress);
  } catch (error) {
    res.status(400).json({
      message: 'Error al actualizar la dirección.',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedAddress = await Address.findByIdAndDelete(id);

    if (!deletedAddress) {
      res.status(404).json({ message: 'Dirección no encontrada.' });
      return;
    }

    res.status(200).json({ message: 'Dirección eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar la dirección.',
      error: error instanceof Error ? error.message : error
    });
  }
};