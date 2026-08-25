/**
 * Controller for managing emails that belong to the authenticated user.
 *
 * @class EmailController
 * @param {string} id - Controller identifier.
 * @property {import('owl-expressjs-utils').OwlModel} model - Email data-access model.
 */
class EmailController {
  /**
   * @param {string} id - Controller identifier.
  * @param {import('owl-expressjs-utils').OwlModel} model - Email data-access model.
   */
  constructor(id, model) {
    this.id = id;
    this.model = model;
  }

  /**
   * Delete an email by its ID.
   * @param {import('express').Request} req - Express request containing the email ID.
    * @param {Object} config - Controller configuration.
    * @param {string} config.id - Controller identifier.
    * @param {import('owl-expressjs-utils').OwlModel} config.model - Email model instance.
   * @returns {Promise<void>} Sends a success response or an error response.
   */
  async delete(req, res) {
    try {
      const id = req.params.id;
      await this.model.delete(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return a specific email by its ID.
   * @param {import('express').Request} req - Express request containing the email ID.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the matching email or an error response.
   */
  async getById(req, res) {
    try {
      const emailId = req.params.id;
      const email = await this.model.getById(emailId);
      if (!email) {
        return res.status(404).json({ message: "Email not found." });
      }

      res.status(200).json(email);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return all emails owned by a specific contact.
   * @param {import('express').Request} req - Express request containing the contact ID.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the matching emails or an error response.
   */
  async getContactEmail(req, res) {
    try {
      const contactId = req.params.id;
      const emails = await this.model.getByCoincidence({
        owner: contactId,
        ownerType: "Contact",
      });
      res.json(emails);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return all emails owned by the authenticated user.
   * @param {import('express').Request} req - Express request containing the user session.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the matching emails or an error response.
   */
  async getUserEmail(req, res) {
    try {
      const userId = req.session.userId;
      const emails = await this.model.getByCoincidence({
        owner: userId,
        ownerType: "User",
      });
      res.json(emails);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create an email for a specific contact.
  * @param {import('express').Request} req - Express request containing email data and the contact ID.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the created email or an error response.
   */
  async registerContactEmail(req, res) {
    try {
      const id = req.params.id;

      const newEmail = await this.model.save({
        ownerType: "Contact",
        owner: id,
        ...req.body,
      });
      res.status(201).json(newEmail);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create an email for the authenticated user.
   *
   * @param {import('express').Request} req - Express request containing email data and the user session.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the created email or an error response.
   */
  async registerUserEmail(req, res) {
    try {
      const userId = req.session.userId;

      const newEmail = await this.model.save({
        ownerType: "User",
        owner: userId,
        ...req.body,
      });
      res.status(201).json(newEmail);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update an email by its ID.
   * @param {import('express').Request} req - Express request containing the email ID and updated data.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the updated email or an error response.
   */
  async update(req, res) {
    try {
      const emailId = req.params.id;
      const updatedEmail = await this.model.update(emailId, req.body);
      if (!updatedEmail) {
        return res.status(404).json({ message: "Email not found." });
      }
      res.status(200).json(updatedEmail);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

/**
 * Create an EmailController from the configured dependency models.
 * @param {Object} config - Controller configuration.
 * @param {string} config.id - Controller identifier.
 * @param {Object} config - Controller configuration.
 * @param {string} config.id - Controller identifier.
 * @param {import('owl-expressjs-utils').OwlModel} config.model - Email model instance.
 * @returns {EmailController} Configured email controller.
 */
export default ({ id, model }) => new EmailController(id, model);
