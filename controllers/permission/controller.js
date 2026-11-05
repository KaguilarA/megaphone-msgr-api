/** Lists the full permission catalog for permission-assignment screens. */
export default function ({ model }) {
  async function getAll(req, res) {
    try {
      const permissions = await model.getAll();
      return res.json(permissions);
    } catch (error) {
      return res.status(500).json({
        message: "Permission list error.",
        error: error.message || error,
      });
    }
  }

  return { getAll };
}
