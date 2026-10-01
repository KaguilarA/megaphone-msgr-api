/**
 * Controller for managing emails that belong to the authenticated user.
 *
 * @class EmailController
 * @param {string} id - Controller identifier.
 * @property {import('owl-expressjs-utils').OwlModel} model - Email data-access model.
 */
export default function ({ id, model, stateModel }) {
  async function getActiveState() {
    if (!stateModel) return undefined;

    return await stateModel.getOne({ name: "Activo", entity: "Email" })
      || await stateModel.save({
        name: "Activo",
        description: "El email está activo.",
        entity: "Email",
      });
  }

  /**
   * Delete an email by its ID.
   * @param {import('express').Request} req Express request containing the email ID.
    * @param {Object} config Controller configuration.
    * @param {string} config.id Controller identifier.
    * @param {import('owl-expressjs-utils').OwlModel} config.model - Email model instance.
   * @returns {Promise<void>} Sends a success response or an error response.
   */
  async function deleteDataById(req, res) {
    try {
      const id = req.params.id;
      await model.delete(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return a specific email by its ID.
   * @param {import('express').Request} req Express request containing the email ID.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching email or an error response.
   */
  async function getDataById(req, res) {
    try {
      const id = req.params.id;
      const data = await model.getById(id);
      if (!data) {
        return res.status(404).json({ message: "Email not found." });
      }

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return all emails owned by a specific contact.
   * @param {import('express').Request} req Express request containing the contact ID.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching emails or an error response.
   */
  async function getDataForContact(req, res) {
    try {
      const owner = req.params.id;
      const data = await model.getByCoincidence({
        owner,
        ownerType: "Contact",
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return all emails owned by the authenticated user.
   * @param {import('express').Request} req Express request containing the user session.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching emails or an error response.
   */
  async function getDataForUser(req, res) {
    try {
      const owner = req.session.userId;
      const data = await model.getByCoincidence({
        owner,
        ownerType: "User",
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create an email for a specific contact.
  * @param {import('express').Request} req Express request containing email data and the contact ID.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the created email or an error response.
   */
  async function registerForContact(req, res) {
    try {
      const owner = req.params.id;
      const activeState = await getActiveState();

      const newData = await model.save({
        ...req.body,
        ownerType: "Contact",
        owner,
        ...(activeState ? { state: activeState._id } : {}),
      });
      res.status(201).json(newData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create an email for the authenticated user.
   *
   * @param {import('express').Request} req Express request containing email data and the user session.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the created email or an error response.
   */
  async function registerForUser(req, res) {
    try {
      const owner = req.session.userId;
      const existing = typeof model.getOne === "function"
        ? await model.getOne({ owner, ownerType: "User" })
        : null;
      if (existing) {
        return res.status(409).json({ message: "User already has an email." });
      }
      const activeState = await getActiveState();

      const newData = await model.save({
        ...req.body,
        ownerType: "User",
        owner,
        ...(activeState ? { state: activeState._id } : {}),
      });
      res.status(201).json(newData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update an email by its ID.
   * @param {import('express').Request} req Express request containing the email ID and updated data.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the updated email or an error response.
   */
  async function updateDataById(req, res) {
    try {
      const id = req.params.id;
      const updated = await model.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Email not found." });
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  return {
    deleteDataById,
    getDataById,
    getDataForContact,
    getDataForUser,
    registerForContact,
    registerForUser,
    updateDataById,
    getContactEmail: getDataForContact,
    registerUserEmail: registerForUser,
  };
}
