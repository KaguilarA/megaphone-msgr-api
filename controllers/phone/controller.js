/**
 * Controller for managing phone numbers that belong to the authenticated user.
 *
 * @class PhoneController
 * @param {string} id - Controller identifier.
 * @property {import('owl-expressjs-utils').OwlModel} model - Email data-access model.
 */
class PhoneController {
  /**
   * @param {string} id - Controller identifier.
   * @param {import('owl-expressjs-utils').OwlModel} model - Address data-access model.
   */
  constructor(id, model) {
    this.id = id;
    this.model = model;
  }

  /**
   * Delete an email by its ID.
   * @param {import('express').Request} req - Express request containing the email ID.
   * @param {import('express').Response} res - Express response.
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
      const id = req.params.id;
      const phoneNumber = await this.model.getById(id);
      if (!phoneNumber) {
        return res.status(404).json({ message: "Phone number not found." });
      }

      res.status(200).json(phoneNumber);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return all phone numbers owned by a specific contact.
   * @param {import('express').Request} req - Express request containing the contact ID.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the matching phone numbers or an error response.
   */
  async getContactPhoneNumber(req, res) {
    try {
      const id = req.params.id;
      const phoneNumbers = await this.model.getByCoincidence({
        owner: id,
        ownerType: "Contact",
      });
      res.json(phoneNumbers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return all phone numbers owned by the authenticated user.
   * @param {import('express').Request} req - Express request containing the user session.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the matching phone numbers or an error response.
   */
  async getUserPhoneNumber(req, res) {
    try {
      const id = req.session.userId;
      const phoneNumbers = await this.model.getByCoincidence({
        owner: id,
        ownerType: "User",
      });
      res.json(phoneNumbers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create a phone number for a specific contact.
   * @param {import('express').Request} req - Express request containing phone number data and the contact ID.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the created phone number or an error response.
   */
  async registerContactPhoneNumber(req, res) {
    try {
      const id = req.params.id;

      const newPhoneNumber = await this.model.save({
        ownerType: "Contact",
        owner: id,
        ...req.body,
      });
      res.status(201).json(newPhoneNumber);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create a phone number for the authenticated user.
   * @param {import('express').Request} req - Express request containing phone number data and the user session.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the created phone number or an error response.
   */
  async registerUserPhoneNumber(req, res) {
    try {
      const userId = req.session.userId;

      const newPhoneNumber = await this.model.save({
        ownerType: "User",
        owner: userId,
        ...req.body,
      });
      res.status(201).json(newPhoneNumber);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update a phone number by its ID.
   * @param {import('express').Request} req - Express request containing the phone number ID and updated data.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the updated phone number or an error response.
   */
  async updatePhoneNumber(req, res) {
    try {
      const phoneNumberId = req.params.id;
      const updatedPhoneNumber = await this.model.update(phoneNumberId, req.body);
      if (!updatedPhoneNumber) {
        return res.status(404).json({ message: "Phone number not found." });
      }
      res.status(200).json(updatedPhoneNumber);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

/**
 * Create a PhoneController from the configured dependency models.
 * @param {Object} config - Controller configuration.
 * @param {string} config.id - Controller identifier.
 * @param {Array<{model: import('owl-expressjs-utils').OwlModel}>} config.models - Models in phone, user, and contact order.
 * @returns {PhoneController} Configured phone controller.
 */
export default ({ id, model }) => new PhoneController(id, model);
