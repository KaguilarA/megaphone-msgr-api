export default ({ entityId, model, populatedFields }) => {

  async function getInfo(req, res) {
    try {
      if (req.session.userId) {
        const userData = await model.getById(req.session.userId, {
          populate: populatedFields,
        });

        return res.json(userData);
      }

      return res.status(404).json({
        message: `${entityId} not found.`
      });

    } catch (error) {
      res.status(500).json({
        message: `${entityId} list error.`,
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
      const updatedData = await model.update(req.session.userId, req.body, {
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
    getInfo,
    register,
    update,
  };
};
