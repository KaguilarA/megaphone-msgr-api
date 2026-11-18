/**
 * Controller exposing the static list of supported countries and dial codes.
 *
 * @class CountriesController
 * @param {string} id - Controller identifier.
 * @property {Array<Object>} model - In-memory country dataset.
 */
export default function ({ id, model }) {
  /**
   * Return every supported country as `{ code, idd }`, sorted by code.
   * @param {import('express').Request} _req - Unused Express request.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the country list.
   */
  async function getAll(_req, res) {
    const countriesData = model
      .map((c) => ({
        code: c.code,
        idd: c.dialCode,
      }))
      .filter((c) => c.idd && c.code)
      .sort((a, b) => a.code.localeCompare(b.code));

    res.status(200).json(countriesData);
  }

  return {
    getAll,
  };
}
