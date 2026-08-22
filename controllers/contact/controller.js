class ContactController {

  constructor(id, model) {
    this.id = id;
    this.model = model;
  }

  async delete(req, res) {
    try {
      const contactId = req.params.id;
      await this.model.delete(contactId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

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

  async getAll(req, res) {
    try {
      const userId = req.user.id;
      const contacts = await this.model.getByCoincidence({
        owner: userId
      });
      res.status(200).json(contacts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

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

export default ({ id, model }) => new ContactController(id, model);