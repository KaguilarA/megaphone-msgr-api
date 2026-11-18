export default function ({ id, model, stateModel }) {
  async function createAddress(ownerType, owner, body) {
    const address = {
      ...body,
      ownerType,
      owner,
    };

    if (stateModel) {
      const [activeState] = await stateModel.getByCoincidence({
        name: "Activo",
        entity: id,
      });
      if (!activeState) {
        throw new Error(`Active state is not configured for ${id}.`);
      }
      address.state = activeState._id;
    }

    return model.save(address);
  }

  /**
   * Delete an address by its ID.
   * @param {import('express').Request} req Express request containing the address ID.
   * @param {import('express').Response} res Express response.
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
   * Return a specific address by its ID.
   * @param {import('express').Request} req Express request containing the address ID.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching address or an error response.
   */
  async function getDataById(req, res) {
    try {
      const id = req.params.id;
      const data = await model.getById(id);
      if (!data) {
        return res.status(404).json({ message: "Data not found." });
      }

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return all addresses owned by a specific contact.
   * @param {import('express').Request} req Express request containing the contact ID.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching addresses or an error response.
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
   * Return all addresses owned by the authenticated user.
   * @param {import('express').Request} req Express request containing the user session.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching addresses or an error response.
   */
  async function getDataForUser(req, res) {
    try {
      const owner = req.session.userId;
      const data = await model.getByCoincidence({
        owner: owner,
        ownerType: "User",
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create an address for a specific contact.
   * @param {import('express').Request} req Express request containing address data and the contact ID.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the created address or an error response.
   */
  async function registerForContact(req, res) {
    try {
      const owner = req.params.id;
      const newData = await createAddress("Contact", owner, req.body);
      res.status(201).json(newData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create an address for the authenticated user.
   * @param {import('express').Request} req Express request containing address data and the user session.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the created address or an error response.
   */
  async function registerForUser(req, res) {
    try {
      const owner = req.session.userId;
      const newData = await createAddress("User", owner, req.body);
      res.status(201).json(newData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update an address by its ID.
   * @param {import('express').Request} req Express request containing the address ID and updated data.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the updated address or an error response.
   */
  async function updateDataById(req, res) {
    try {
      const id = req.params.id;
      const updatedData = await model.update(id, req.body);
      if (!updatedData) {
        return res.status(404).json({ message: "Data not found." });
      }
      res.status(200).json(updatedData);
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
    getContactAddresses: getDataForContact,
    registerUserAddress: registerForUser,
  };
}
