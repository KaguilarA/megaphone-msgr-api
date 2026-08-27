export default function ({ id, model, receptorModel, populatedFields = [] }) {
  /**
   * Remove every MessageReceptor document linked to a message.
   * @param {string} messageId Message identifier used to match receptors.
   * @returns {Promise<void>} Resolves when all linked receptors have been removed.
   */
  async function clearReceptors(messageId) {
    const receptors = await receptorModel.getByCoincidence({
      message: messageId,
    });
    await Promise.all(
      receptors.map((receptor) => receptorModel.delete(receptor._id)),
    );
  }

  /**
   * Create a MessageReceptor document per contact ID.
   * @param {string} messageId Message identifier to link.
   * @param {string[]} contactIds Contact IDs that should receive the message.
   * @returns {Promise<Array>} Created receptor documents.
   */
  async function createReceptors(messageId, contactIds = []) {
    return Promise.all(
      contactIds.map((contactId) =>
        receptorModel.save({ message: messageId, contact: contactId }),
      ),
    );
  }

  /**
   * Delete a message and all of its recipient links.
   * @param {import('express').Request} req Express request containing the message ID.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends a success response or an error response.
   */
  async function deleteById(req, res) {
    try {
      const id = req.params.id;
      await clearReceptors(id);
      await model.delete(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
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

      const newMessage = await this.model.save({
        ...messageData,
        sender: id,
      });

      const receptors = await this.createReceptors(newMessage._id, contacts);

      res.status(201).json({ ...newMessage.toJSON(), receptors });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update a message by its ID and, when provided, replace its recipient list.
   * @param {import('express').Request} req Express request containing the message ID, updated data, and an optional contact ID array.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the updated message with its receptors or an error response.
   */
  async function update(req, res) {
    try {
      const messageId = req.params.id;
      const { contacts, ...messageData } = req.body;

      const updatedMessage = await model.update(messageId, messageData, {
        populate: populatedFields,
      });

      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found." });
      }

      let receptors;
      if (Array.isArray(contacts)) {
        await clearReceptors(messageId);
        receptors = await createReceptors(messageId, contacts);
      } else {
        receptors = await receptorModel.getByCoincidence(
          { message: messageId },
          { populate: "contact" },
        );
      }

      res.status(200).json({ ...updatedMessage.toJSON(), receptors });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  return {
    deleteById,
    getAll,
    getById,
    register,
    update,
  };
};
