import { states } from "./../../utils/states.js";

export default function ({ id, model }) {
  let activeState;

  states
    .getStateByNameAndEntity("Activo", id)
    .then((states) => (activeState = states[0]));

  /**
   * Delete a contact by its ID.
   * @param {import('express').Request} req - Express request containing the contact ID.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends a success response or an error response.
   */
  async function deleteById(req, res) {
    try {
      const contactId = req.params.id;
      await model.delete(contactId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return all contacts owned by the authenticated user.
   * @param {import('express').Request} req Express request containing the authenticated user.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching contacts or an error response.
   */
  async function getAll(req, res) {
    try {
      const userId = req.session?.userId;
      const contacts = await model.getByCoincidence(
        {
          owner: userId,
        },
        {
          populate: ['state'],
        },
      );
      res.status(200).json(contacts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return a specific contact by its ID.
   * @param {import('express').Request} req Express request containing the contact ID.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching contact or an error response.
   */
  async function getById(req, res) {
    try {
      const contactId = req.params.id;
      const contact = await model.getById(contactId);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found." });
      }
      res.status(200).json(contact);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create a contact for the authenticated user.
   * @param {import('express').Request} req Express request containing contact data and the authenticated user.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the created contact or an error response.
   */
  async function register(req, res) {
    try {
      const userId = req.session?.userId;
      const contactData = req.body;
      contactData.owner = userId;
      contactData.state = activeState._id;
      const newContact = await model.save(contactData);
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
  async function updateById(req, res) {
    try {
      const contactId = req.params.id;
      const updatedData = req.body;
      const updatedContact = await model.update(contactId, updatedData);
      if (!updatedContact) {
        return res.status(404).json({ message: "Contact not found." });
      }
      res.status(200).json(updatedContact);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  return {
    deleteById,
    getAll,
    getById,
    register,
    updateById,
  };
}
