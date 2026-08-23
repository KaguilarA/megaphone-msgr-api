/**
 * Controller for managing messages and their recipient list, scoped to the authenticated sender.
 *
 * Sending a message through an external provider (WhatsApp, Telegram, etc.) is out of scope
 * here and will be implemented later as a separate module.
 *
 * @class MessageController
 * @param {string} id - Controller identifier.
 * @property {import('owl-expressjs-utils').OwlModel} model - Message data-access model.
 * @property {import('owl-expressjs-utils').OwlModel} receptorModel - MessageReceptor data-access model.
 * @property {string[]} populatedFields - Message reference fields to populate on read.
 */
class MessageController {
  /**
   * @param {string} id - Controller identifier.
   * @param {import('owl-expressjs-utils').OwlModel} model - Message data-access model.
   * @param {import('owl-expressjs-utils').OwlModel} receptorModel - MessageReceptor data-access model.
   * @param {string[]} [populatedFields] - Message reference fields to populate on read.
   */
  constructor(id, model, receptorModel, populatedFields = []) {
    this.id = id;
    this.model = model;
    this.receptorModel = receptorModel;
    this.populatedFields = populatedFields;
  }

  /**
   * Remove every MessageReceptor document linked to a message.
   * @param {string} messageId - Message identifier used to match receptors.
   * @returns {Promise<void>}
   */
  async clearReceptors(messageId) {
    const receptors = await this.receptorModel.getByCoincidence({ message: messageId });
    await Promise.all(receptors.map((receptor) => this.receptorModel.delete(receptor._id)));
  }

  /**
   * Create a MessageReceptor document per contact ID.
   * @param {string} messageId - Message identifier to link.
   * @param {string[]} contactIds - Contact IDs that should receive the message.
   * @returns {Promise<Array>} Created receptor documents.
   */
  async createReceptors(messageId, contactIds = []) {
    return Promise.all(
      contactIds.map((contactId) =>
        this.receptorModel.save({ message: messageId, contact: contactId }),
      ),
    );
  }

  /**
   * Delete a message and all of its recipient links.
   * @param {import('express').Request} req - Express request containing the message ID.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends a success response or an error response.
   */
  async delete(req, res) {
    try {
      const messageId = req.params.id;
      await this.clearReceptors(messageId);
      await this.model.delete(messageId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return a specific message by its ID, including its recipient contacts.
   * @param {import('express').Request} req - Express request containing the message ID.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the matching message with its receptors or an error response.
   */
  async getById(req, res) {
    try {
      const messageId = req.params.id;
      const message = await this.model.getById(messageId, { populate: this.populatedFields });
      if (!message) {
        return res.status(404).json({ message: "Message not found." });
      }

      const receptors = await this.receptorModel.getByCoincidence(
        { message: messageId },
        { populate: "contact" },
      );

      res.status(200).json({ ...message.toJSON(), receptors });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return all messages sent by the authenticated user.
   * @param {import('express').Request} req - Express request containing the user session.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the matching messages or an error response.
   */
  async getAll(req, res) {
    try {
      const userId = req.session.userId;
      const messages = await this.model.getByCoincidence(
        { sender: userId },
        { populate: this.populatedFields },
      );
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create a message for the authenticated user and its recipient list.
   * @param {import('express').Request} req - Express request containing message data, the contact ID array, and the user session.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the created message with its receptors or an error response.
   */
  async register(req, res) {
    try {
      const userId = req.session.userId;
      const { contacts = [], ...messageData } = req.body;

      const newMessage = await this.model.save({
        ...messageData,
        sender: userId,
      });

      const receptors = await this.createReceptors(newMessage._id, contacts);

      res.status(201).json({ ...newMessage.toJSON(), receptors });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update a message by its ID and, when provided, replace its recipient list.
   * @param {import('express').Request} req - Express request containing the message ID, updated data, and an optional contact ID array.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the updated message with its receptors or an error response.
   */
  async update(req, res) {
    try {
      const messageId = req.params.id;
      const { contacts, ...messageData } = req.body;

      const updatedMessage = await this.model.update(messageId, messageData, {
        populate: this.populatedFields,
      });

      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found." });
      }

      let receptors;
      if (Array.isArray(contacts)) {
        await this.clearReceptors(messageId);
        receptors = await this.createReceptors(messageId, contacts);
      } else {
        receptors = await this.receptorModel.getByCoincidence(
          { message: messageId },
          { populate: "contact" },
        );
      }

      res.status(200).json({ ...updatedMessage.toJSON(), receptors });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

/**
 * Create a MessageController from the configured dependency models.
 * @param {Object} config - Controller configuration.
 * @param {string} config.id - Controller identifier.
 * @param {import('owl-expressjs-utils').OwlModel} config.model - Message data-access model.
 * @param {import('owl-expressjs-utils').OwlModel} config.receptorModel - MessageReceptor data-access model.
 * @param {string[]} [config.populatedFields] - Message reference fields to populate on read.
 * @returns {MessageController} Configured message controller.
 */
export default ({ id, model, receptorModel, populatedFields }) =>
  new MessageController(id, model, receptorModel, populatedFields);
