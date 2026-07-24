export default class {

  constructor(id, model, populatedFiels = []) {
    this.id = id;
    this.model = model;
    this.populatedFiels = populatedFiels;
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const deletedData = await this.model.delete(id);

      if (!deletedData) {
        res.status(404).json({ message: `${this.id} not found.` });
        return;
      }

      res.json({ message: `${this.id} removed.` });
    } catch (error) {
      res.status(500).json({
        message: `${this.id} remove error.`,
        error: error.message || error,
      });
    }
  }

  async getAll(req, res) {
    try {
      const allData = await this.model.getAll({
        populate: this.populatedFiels,
      });
      res.json(allData);
    } catch (error) {
      res.status(500).json({
        message: `${this.id} list error.`,
        error: error.message || error,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const coincidence = await this.model.getById(id, {
        populate: this.populatedFiels,
      });

      if (!coincidence) {
        res.status(404).json({ message: `${this.id} not found.` });
        return;
      }

      res.json(coincidence);
    } catch (error) {
      res.status(500).json({
        message: `${this.id} search error.`,
        error: error.message || error,
      });
    }
  }

  async register(req, res) {
    try {
      const newData = await this.model.save(req.body);
      res.status(201).json(newData);
    } catch (error) {
      res.status(400).json({
        message: `${this.id} register error.`,
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updatedData = await this.model.update(id, req.body, {
        populate: this.populatedFiels,
      });

      if (!updatedData) {
        res.status(404).json({ message: `${this.id} not found.` });
        return;
      }

      res.json(updatedData);
    } catch (error) {
      res.status(500).json({
        message: `${this.id} error update.`,
        error: error.message || error,
      });
    }
  }
}
