export default ({ id, models: [userConfig, emailConfig] }) =>
  new (class {
    constructor(id, userModel, emailModel) {
      this.id = id;
      this.emailModel = emailModel;
      this.userModel = userModel;
    }

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

        // owner is the User's primary key, so this is an indexed point lookup
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

    logout(req, res) {
      req.session.destroy((err) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "No se pudo cerrar la sesión." });
        }
        res.clearCookie("connect.sid");
        return res.status(200).json({ message: "Sesión cerrada exitosamente" });
      });
    }

    status(req, res) {
      const user = req.user || null;

      if (req.session?.userId || user) {
        return res.status(200).json({
          authenticated: true,
          user: user ? user.toJSON ? user.toJSON() : user : undefined,
        });
      }

      return res.status(200).json({ authenticated: false });
    }
  })(id, userConfig.model, emailConfig.model);
