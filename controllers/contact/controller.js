/**
 * Controller for managing contacts that belong to the authenticated user.
 *
 * @class ContactController
 * @param {string} id - Controller identifier.
 * @property {import('owl-expressjs-utils').OwlModel} model - Contact data-access model.
 */
class ContactController {

  /**
   * @param {string} id - Controller identifier.
   * @param {import('owl-expressjs-utils').OwlModel} model - Contact data-access model.
   */
  constructor(id, model) {
    this.id = id;
    this.model = model;
  }

  /**
   * Delete a contact by its ID.
   * @param {import('express').Request} req - Express request containing the contact ID.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends a success response or an error response.
   */
  async delete(req, res) {
    try {
      const contactId = req.params.id;
      await this.model.delete(contactId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return a specific contact by its ID.
   * @param {import('express').Request} req - Express request containing the contact ID.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the matching contact or an error response.
   */
  async getById(req, res) {
    try {
      const contactId = req.params.id;
      const contact = await this.model.getById(contactId);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found." });
      }
      res.status(200).json(contact);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return all contacts owned by the authenticated user.
   * @param {import('express').Request} req - Express request containing the authenticated user.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the matching contacts or an error response.
   */
  async getAll(req, res) {
    try {
      const userId = req.session?.userId;
      const contacts = await this.model.getByCoincidence({
        owner: userId
      });
      res.status(200).json(contacts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create a contact for the authenticated user.
   * @param {import('express').Request} req - Express request containing contact data and the authenticated user.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the created contact or an error response.
   */
  async register(req, res) {
    try {
      const userId = req.user.id;
      const contactData = req.body;
      contactData.owner = userId;
      const newContact = await this.model.create(contactData);
      res.status(201).json(newContact);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update a contact by its ID.
   * @param {import('express').Request} req - Express request containing the contact ID and updated data.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the updated contact or an error response.
   */
  async update(req, res) {
    try {
      const contactId = req.params.id;
      const updatedData = req.body;
      const updatedContact = await this.model.update(contactId, updatedData);
      if (!updatedContact) {
        return res.status(404).json({ message: "Contact not found." });
      }
      res.status(200).json(updatedContact);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

/**
 * Create a ContactController from the configured dependency model.
 * @param {Object} config - Controller configuration.
 * @param {string} config.id - Controller identifier.
 * @param {import('owl-expressjs-utils').OwlModel} config.model - Contact data-access model.
 * @returns {ContactController} Configured contact controller.
 */
export default ({ id, model }) => new ContactController(id, model);