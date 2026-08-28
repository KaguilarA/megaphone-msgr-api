/**
 * Create a PhoneController from the configured dependency models.
 * @param {Object} config Controller configuration.
 * @param {string} config.id Controller identifier.
 * @param {import('owl-expressjs-utils').OwlModel} config.model Phone-number data-access model.
 * @param {import('owl-expressjs-utils').OwlModel} config.stateModel State data-access model.
 * @returns {PhoneController} Configured phone controller.
 */
export default function ({ id, model, stateModel }) {
  async function getActiveState() {
    if (!stateModel) return undefined;

    return (
      (await stateModel.getOne({ name: "active", type: "phone" })) ||
      (await stateModel.save({
        name: "active",
        description: "Phone number is active.",
        type: "phone",
      }))
    );
  }

  /**
   * Delete a phone number by its ID.
   * @param {import('express').Request} req Express request containing the phone-number ID.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends a success response or an error response.
   */
  const deleteDataById = async (req, res) => {
    try {
      const id = req.params.id;
      await model.delete(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Return a specific phone number by its ID.
   * @param {import('express').Request} req Express request containing the phone-number ID.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching phone number or an error response.
   */
  const getDataById = async (req, res) => {
    try {
      const id = req.params.id;
      const data = await model.getById(id);
      if (!data) {
        return res.status(404).json({ message: "Phone number not found." });
      }

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Return all phone numbers owned by a specific contact.
   * @param {import('express').Request} req Express request containing the contact ID.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching phone numbers or an error response.
   */
  const getDataForContact = async (req, res) => {
    try {
      const owner = req.params.id;
      const data = await model.getByCoincidence({
        ownerType: "Contact",
        owner,
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Return all phone numbers owned by the authenticated user.
   * @param {import('express').Request} req Express request containing the user session.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching phone numbers or an error response.
   */
  const getDataForUser = async (req, res) => {
    try {
      const owner = req.session.userId;
      const data = await model.getByCoincidence({
        ownerType: "User",
        owner,
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Create a phone number for a specific contact.
   * @param {import('express').Request} req Express request containing phone number data and the contact ID.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the created phone number or an error response.
   */
  const registerForContact = async (req, res) => {
    try {
      const owner = req.params.id;
      const activeState = await getActiveState();

      const newData = await model.save({
        ...req.body,
        ownerType: "Contact",
        owner,
        ...(activeState ? { state: [activeState._id] } : {}),
      });
      res.status(201).json(newData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Create a phone number for the authenticated user.
   * @param {import('express').Request} req Express request containing phone number data and the user session.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the created phone number or an error response.
   */
  const registerForUser = async (req, res) => {
    try {
      const owner = req.session.userId;
      const activeState = await getActiveState();

      const newData = await model.save({
        ...req.body,
        ownerType: "User",
        owner,
        ...(activeState ? { state: [activeState._id] } : {}),
      });
      res.status(201).json(newData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Update a phone number by its ID.
   * @param {import('express').Request} req Express request containing the phone number ID and updated data.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the updated phone number or an error response.
   */
  const updateDataById = async (req, res) => {
    try {
      const id = req.params.id;
      const updated = await model.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Phone number not found." });
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  return {
    deleteDataById,
    getDataById,
    getDataForContact,
    getDataForUser,
    registerForContact,
    registerForUser,
    updateDataById,
  };
}
