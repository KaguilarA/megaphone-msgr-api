/**
 * Controller exposing the static list of supported countries and dial codes.
 *
 * @class CountriesController
 * @param {string} id - Controller identifier.
 * @property {Array<Object>} model - In-memory country dataset.
 */
class CountriesController {
  /**
   * @param {string} id - Controller identifier.
   * @param {Array<Object>} model - In-memory country dataset.
   */
  constructor(id, model) {
    this.id = id;
    this.model = model;
  }

  /**
   * Return every supported country as `{ code, idd }`, sorted by code.
   * @param {import('express').Request} _req - Unused Express request.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the country list.
   */
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

/**
 * Create a CountriesController from the configured dependency dataset.
 * @param {Object} config - Controller configuration.
 * @param {string} config.id - Controller identifier.
 * @param {Array<Object>} config.model - In-memory country dataset.
 * @returns {CountriesController} Configured countries controller.
 */
export default ({ id, model }) => new CountriesController(id, model);
