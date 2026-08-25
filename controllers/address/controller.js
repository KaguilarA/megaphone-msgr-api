/**
 * Controller for managing addresses that belong to the authenticated user.
 *
 * @class AddressController
 * @param {string} id - Controller identifier.
 * @property {import('owl-expressjs-utils').OwlModel} model - Address data-access model.
 */
class AddressController {
  /**
   * @param {string} id - Controller identifier.
   * @param {import('owl-expressjs-utils').OwlModel} model - Address data-access model.
   */
  constructor(id, model) {
    this.id = id;
    this.model = model;
  }

  /**
   * Delete an address by its ID.
   *
   * @param {import('express').Request} req - Express request containing the address ID.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends a success response or an error response.
   */
  async deleteAddress(req, res) {
    try {
      const addressId = req.params.id;
      await this.model.delete(addressId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return a specific address by its ID.
   *
   * @param {import('express').Request} req - Express request containing the address ID.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the matching address or an error response.
   */
  async getAddressById(req, res) {
    try {
      const addressId = req.params.id;
      const address = await this.model.getById(addressId);
      if (!address) {
        return res.status(404).json({ message: "Address not found." });
      }

      res.status(200).json(address);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return all addresses owned by a specific contact.
   *
   * @param {import('express').Request} req - Express request containing the contact ID.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the matching addresses or an error response.
   */
  async getContactAddresses(req, res) {
    try {
      const contactId = req.params.id;
      const addresses = await this.model.getByCoincidence({
        owner: contactId,
        ownerType: "Contact",
      });
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return all addresses owned by the authenticated user.
   *
   * @param {import('express').Request} req - Express request containing the user session.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the matching addresses or an error response.
   */
  async getUserAddresses(req, res) {
    try {
      const userId = req.session.userId;
      const addresses = await this.model.getByCoincidence({
        owner: userId,
        ownerType: "User",
      });
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create an address for a specific contact.
   *
   * @param {import('express').Request} req - Express request containing address data and the contact ID.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the created address or an error response.
   */
  async registerContactAddress(req, res) {
    try {
      const contactId = req.params.id;

      const newAddress = await this.model.save({
        ownerType: "Contact",
        owner: contactId,
        ...req.body,
      });
      res.status(201).json(newAddress);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create an address for the authenticated user.
   *
   * @param {import('express').Request} req - Express request containing address data and the user session.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the created address or an error response.
   */
  async registerUserAddress(req, res) {
    try {
      const userId = req.session.userId;

      const newAddress = await this.model.save({
        ownerType: "User",
        owner: userId,
        ...req.body,
      });
      res.status(201).json(newAddress);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update an address by its ID.
   * @param {import('express').Request} req - Express request containing the address ID and updated data.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the updated address or an error response.
   */
  async updateAddress(req, res) {
    try {
      const addressId = req.params.id;
      const updatedAddress = await this.model.update(addressId, req.body);
      if (!updatedAddress) {
        return res.status(404).json({ message: "Address not found." });
      }
      res.status(200).json(updatedAddress);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

/**
 * Create an AddressController from the configured dependency models.
 *
 * @param {Object} config - Controller configuration.
 * @param {string} config.id - Controller identifier.
  * @param {import('owl-expressjs-utils').OwlModel} config.model - Address model instance.
 * @returns {AddressController} Configured address controller.
 */
export default ({ id, model }) => new AddressController(id, model);
