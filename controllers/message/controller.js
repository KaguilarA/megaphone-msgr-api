export default function ({ id, model, receptorModel, populatedFields = [] }) {

  async function createReceptors(messageId, contacts) {
    return Promise.all(
      contacts.map((contact) =>
        receptorModel.save({ message: messageId, contact }),
      ),
    );
  }

  /**
   * Return all messages sent by the authenticated user.
   * @param {import('express').Request} req Express request containing the user session.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching messages or an error response.
   */
  async function getAll(req, res) {
    try {
      const id = req.session.userId;
      const data = await model.getByCoincidence(
        { sender: id },
        { populate: populatedFields },
      );
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return a specific message by its ID, including its recipient contacts.
   * @param {import('express').Request} req Express request containing the message ID.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching message with its receptors or an error response.
   */
  async function getById(req, res) {
    try {
      const messageId = req.params.id;
      const message = await model.getById(messageId, {
        populate: populatedFields,
      });
      if (!message) {
        return res.status(404).json({ message: "Message not found." });
      }

      const receptors = await receptorModel.getByCoincidence(
        { message: messageId },
        { populate: "contact" },
      );

      res.status(200).json({ ...message.toJSON(), receptors });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create a message for the authenticated user and its recipient list.
   * @param {import('express').Request} req Express request containing message data, the contact ID array, and the user session.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the created message with its receptors or an error response.
   */
  async function register(req, res) {
    try {
      const id = req.session.userId;
      const { contacts = [], ...messageData } = req.body;

      const newMessage = await model.save({
        ...messageData,
        sender: id,
      });

      const receptors = await createReceptors(newMessage._id, contacts);

      res.status(201).json({ ...newMessage.toJSON(), receptors });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async function remove(req, res) {
    try {
      const messageId = req.params.id;
      const receptors = await receptorModel.getByCoincidence({ message: messageId });

      await Promise.all(
        receptors.map((receptor) => receptorModel.delete(receptor._id)),
      );
      await model.delete(messageId);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return {
    getAll,
    getById,
    register,
    delete: remove,
  };
};
