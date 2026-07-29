export default ({ id, models: [emailModel, userModel] }) =>
  new (class {
    constructor(id, emailModel, userModel) {
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
        const emailDoc = await this.emailModel.findOne({
          email: emailInput.trim().toLowerCase(),
        });

        if (!emailDoc) {
          return res.status(401).json({ error: "Credenciales inválidas." });
        }

        const user = await this.userModel.getOne(
          { email: emailDoc._id },
          { populatedFiels: [] },
        );

        if (!user) {
          return res.status(401).json({ error: "Credenciales inválidas." });
        }

        const isMatch = await user.compareHash(password, user.password);

        if (!isMatch) {
          return res.status(401).json({ error: "Credenciales inválidas." });
        }

        req.session.userId = user._id;

        return res
          .status(200)
          .json({ message: "Inicio de sesión exitoso", user: user.toJSON() });
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
  })(id, emailModel, userModel);
