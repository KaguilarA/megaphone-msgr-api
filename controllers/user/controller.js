/**
 * Create the user controller for registration and authenticated account operations.
 * @param {Object} config - Controller configuration.
 * @param {string} config.entityId - Entity name used in response messages.
 * @param {import('owl-expressjs-utils').OwlModel} config.model - User data-access model.
 * @param {import('owl-expressjs-utils').OwlModel} [config.permissionModel] - Permission lookup model.
 * @param {import('owl-expressjs-utils').OwlModel} [config.userPermissionModel] - User-permission assignment model.
 * @param {string[]} config.populatedFields - User reference fields to populate on read.
 * @returns {{getInfo: Function, register: Function, update: Function}} Bound controller handlers.
 */
export default ({ entityId, model, permissionModel, userPermissionModel, populatedFields }) => {

  /**
   * Return the authenticated user's own account, populated with `populatedFields`.
   * @param {import('express').Request} req - Express request containing the user session.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the user document or an error response.
   */
  async function getInfo(req, res) {
    try {
      if (!req.session.userId) {
        return res.status(404).json({
          message: `${entityId} not found.`
        });
      }

      const userData = await model.getById(req.session.userId, { populate: populatedFields });

      if (!userData) {
        return res.status(404).json({ message: `${entityId} not found.` });
      }

      return res.json(userData);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} list error.`,
        error: error.message || error,
      });
    }
  }

  /**
   * Create a new user document.
   * @param {import('express').Request} req - Express request containing the new user data.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the created user or an error response.
   */
  async function register(req, res) {
    try {
      const newUser = await model.save(req.body);

      if (permissionModel && userPermissionModel) {
        const allPermissions = await permissionModel.getAll();
        const permissions = (Array.isArray(allPermissions) ? allPermissions : []).filter(
          ({ name }) => !/^user:/.test(name),
        );

        if (permissions.length > 0) {
          await Promise.all(
            permissions.map(({ _id }) =>
              userPermissionModel.save({
                user: newUser._id,
                permission: _id,
              }),
            ),
          );
        }
      }

      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({
        message: `${entityId} register error.`,
        error: error.message,
      });
    }
  }

  /**
   * Update the authenticated user's own account.
   * @param {import('express').Request} req - Express request containing the user session and updated data.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the updated user or an error response.
   */
  async function update(req, res) {
    try {
      const updatedData = await model.update(req.session.userId, req.body, {
        populate: populatedFields,
      });

      if (!updatedData) {
        res.status(404).json({ message: `${entityId} not found.` });
        return;
      }

      res.json(updatedData);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} error update.`,
        error: error.message || error,
      });
    }
  }

  return { getInfo, register, update, };
};
