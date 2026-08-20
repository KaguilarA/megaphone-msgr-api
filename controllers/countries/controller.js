class CountriesController {
  constructor(id, model) {
    this.id = id;
    this.model = model;
  }

  async getAll(_req, res) {
    const countriesData = this.model
      .map((c) => ({
        code: c.code,
        idd: c.dialCode,
      }))
      .filter((c) => c.idd && c.code)
      .sort((a, b) => a.code.localeCompare(b.code));

    res.status(200).json(countriesData);
  }
}

export default ({ id, model }) => new CountriesController(id, model);
