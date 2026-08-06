export default ({ entityId, model, populatedFields }) => {

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
