import { OwlController } from "owl-expressjs-utils";

export default ({ entityId = "Contact", model, populatedFields = [] }) => {
  const genericController = OwlController({ entityId, model, populatedFields });

  async function register(req, res) {
    try {
      // owner always comes from the session, never from the client payload
      const newData = await model.save({
        ...req.body,
        owner: req.session.userId,
      });
      res.status(201).json(newData);
    } catch (error) {
      res.status(400).json({
        message: `${entityId} register error.`,
        error: error.message,
      });
    }
  }

  async function getAll(req, res) {
    try {
      const contacts = await model.getByCoincidence(
        { owner: req.session.userId },
        { populate: populatedFields },
      );
      res.json(contacts);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} list error.`,
        error: error.message || error,
      });
    }
  }

  // scope reads/writes/deletes to contacts owned by the requesting user to prevent IDOR
  async function getById(req, res) {
    try {
      const contact = await model.getOne(
        { _id: req.params.id, owner: req.session.userId },
        { populate: populatedFields },
      );

      if (!contact) {
        return res.status(404).json({ message: `${entityId} not found.` });
      }

      res.json(contact);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} error.`,
        error: error.message || error,
      });
    }
  }

  async function update(req, res) {
    try {
      const contact = await model.getOne({
        _id: req.params.id,
        owner: req.session.userId,
      });

      if (!contact) {
        return res.status(404).json({ message: `${entityId} not found.` });
      }

      const updatedData = await model.update(req.params.id, req.body, {
        populate: populatedFields,
      });

      res.json(updatedData);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} error update.`,
        error: error.message || error,
      });
    }
  }

  async function deleteContact(req, res) {
    try {
      const contact = await model.getOne({
        _id: req.params.id,
        owner: req.session.userId,
      });

      if (!contact) {
        return res.status(404).json({ message: `${entityId} not found.` });
      }

      const deletedData = await model.delete(req.params.id);
      res.json(deletedData);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} error delete.`,
        error: error.message || error,
      });
    }
  }

  return {
    ...genericController,
    register,
    getAll,
    getById,
    update,
    delete: deleteContact,
  };
};
