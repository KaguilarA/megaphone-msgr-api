/**
 * Controller for credential-based login, logout, and session status.
 *
 * @class AuthController
 * @param {string} id - Controller identifier.
 * @property {import('owl-expressjs-utils').OwlModel} userModel - User data-access model.
 * @property {import('owl-expressjs-utils').OwlModel} emailModel - Email data-access model.
 */
class AuthController {
  /**
   * @param {string} id - Controller identifier.
   * @param {import('owl-expressjs-utils').OwlModel} userModel - User data-access model.
   * @param {import('owl-expressjs-utils').OwlModel} emailModel - Email data-access model.
   */
  constructor(id, userModel, emailModel) {
    this.id = id;
    this.emailModel = emailModel;
    this.userModel = userModel;
  }

  /**
   * Validate credentials and start a session for the matching user.
   * @param {import('express').Request} req - Express request containing `email` and `password`.
   * @param {import('express').Response} res - Express response.
   * @returns {Promise<void>} Sends the authenticated user or an error response.
   */
  async logIn(req, res) {
    try {
      const { email: emailInput, password } = req.body;

      if (!emailInput || !password) {
        return res
          .status(400)
          .json({ error: "El correo y la contraseña son obligatorios." });
      }
      const emailDoc = await this.emailModel.getOne({
        email: emailInput.trim().toLowerCase(),
        ownerType: "User",
      });

      if (!emailDoc) {
        return res.status(401).json({ error: "Credenciales inválidas." });
      }

      const user = await this.userModel.getById(emailDoc.owner);

      if (!user) {
        return res.status(401).json({ error: "Credenciales inválidas." });
      }

      const isMatch = await this.userModel.compareHash(
        user._id,
        "password",
        password,
      );

      if (!isMatch) {
        return res.status(401).json({ error: "Credenciales inválidas." });
      }

      req.session.userId = user._id;

      req.session.save((err) => {
        if (err) {
          console.error("Error guardando la sesión:", err);
          return res.status(500).json({ error: "Error interno del servidor." });
        }

        return res
          .status(200)
          .json({ message: "Inicio de sesión exitoso", user: user.toJSON() });
      });
    } catch (error) {
      console.error("Error en login:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
  }

  /**
   * Destroy the current session and clear the session cookie.
   * @param {import('express').Request} req - Express request holding the session to destroy.
   * @param {import('express').Response} res - Express response.
   * @returns {void}
   */
  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "No se pudo cerrar la sesión." });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Sesión cerrada exitosamente" });
    });
  }

  /**
   * Report whether the current request is authenticated.
   * @param {import('express').Request} req - Express request holding the session and/or authenticated user.
   * @param {import('express').Response} res - Express response.
   * @returns {void}
   */
  status(req, res) {
    const user = req.user || null;

    if (req.session?.userId || user) {
      return res.status(200).json({
        authenticated: true,
        user: user ? (user.toJSON ? user.toJSON() : user) : undefined,
      });
    }

    return res.status(200).json({ authenticated: false });
  }
}

/**
 * Create an AuthController from the configured dependency models.
 * @param {Object} config - Controller configuration.
 * @param {string} config.id - Controller identifier.
 * @param {Array<{model: import('owl-expressjs-utils').OwlModel}>} config.models - Models in user and email order.
 * @returns {AuthController} Configured auth controller.
 */
export default ({
  id,
  models: [{ model: userModel }, { model: emailModel }],
}) => new AuthController(id, userModel, emailModel);
