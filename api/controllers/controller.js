/**
 * Controller factory for handling HTTP requests and responses for a given model.
 * @param {Object} config - Configuration object.
 * @param {string} config.entityId - Identifier or name of the entity.
 * @param {Object} config.model - Data access model instance containing CRUD operations.
 * @param {string|string[]|Object} [config.populatedFields=[]] - Default fields to populate on queries.
 * @returns {Object} An object containing Express controller functions.
 */
export default ({ entityId, model, populatedFields = [] }) => {
  /**
   * Deletes a document by its ID from request parameters.
   * @param {import("express").Request} req - Express request object.
   * @param {import("express").Response} res - Express response object.
   * @returns {Promise<void>}
   */
  async function remove(req, res) {
    try {
      const { id } = req.params;
      const deletedData = await model.delete(id);

      if (!deletedData) {
        res.status(404).json({ message: `${entityId} not found.` });
        return;
      }

      res.json({ message: `${entityId} removed.` });
    } catch (error) {
      res.status(500).json({
        message: `${entityId} remove error.`,
        error: error.message || error,
      });
    }
  }

  /**
   * Retrieves all documents with default populations applied.
   * @param {import("express").Request} req - Express request object.
   * @param {import("express").Response} res - Express response object.
   * @returns {Promise<void>}
   */
  async function getAll(req, res) {
    try {
      const allData = await model.getAll({
        populate: populatedFields,
      });

      res.json(allData);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} list error.`,
        error: error.message || error,
      });
    }
  }

  /**
   * Retrieves a single document by its unique ID from request parameters.
   * @param {import("express").Request} req - Express request object.
   * @param {import("express").Response} res - Express response object.
   * @returns {Promise<void>}
   */
  async function getById(req, res) {
    try {
      const { id } = req.params;
      const coincidence = await model.getById(id, {
        populate: populatedFields,
      });

      if (!coincidence) {
        res.status(404).json({ message: `${entityId} not found.` });
        return;
      }

      res.json(coincidence);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} search error.`,
        error: error.message || error,
      });
    }
  }

  /**
   * Finds a single document matching criteria passed via request query or body.
   * @param {import("express").Request} req - Express request object.
   * @param {import("express").Response} res - Express response object.
   * @returns {Promise<void>}
   */
  async function getOne(req, res) {
    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter) : req.body;
      const coincidence = await model.getOne(filter, {
        populate: populatedFields,
      });

      if (!coincidence) {
        res.status(404).json({ message: `${entityId} not found.` });
        return;
      }

      res.json(coincidence);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} search error.`,
        error: error.message || error,
      });
    }
  }

  /**
   * Registers and saves a new document using request body data.
   * @param {import("express").Request} req - Express request object.
   * @param {import("express").Response} res - Express response object.
   * @returns {Promise<void>}
   */
  async function register(req, res) {
    try {
      const newData = await model.save(req.body);
      res.status(201).json(newData);
    } catch (error) {
      res.status(400).json({
        message: `${entityId} register error.`,
        error: error.message,
      });
    }
  }

  /**
   * Updates an existing document by its ID using request body data.
   * @param {import("express").Request} req - Express request object.
   * @param {import("express").Response} res - Express response object.
   * @returns {Promise<void>}
   */
  async function update(req, res) {
    try {
      const { id } = req.params;
      const updatedData = await model.update(id, req.body, {
        populate: populatedFields,
      });

      if (!updatedData) {
        res.status(404).json({ message: `${entityId} not found.` });
        return;
      }

      res.json(updatedData);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} error update.`,
        error: error.message || error,
      });
    }
  }

  return {
    delete: remove,
    getAll,
    getById,
    getOne,
    register,
    update,
  };
};
