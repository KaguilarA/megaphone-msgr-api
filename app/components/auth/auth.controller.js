export default () =>
  new (class {
    renderHome(req, res) {
      if (req.user) {
        return res.redirect("/contact");
      }

      res.render("auth/index", { title: "Iniciar sesión" });
    }

    renderRegister(req, res) {
      if (req.user) {
        return res.redirect("/contact");
      }

      res.render("auth/register", { title: "Registrarse" });
    }

    logout(req, res) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error cerrando sesión:", err);
        }

        res.clearCookie("connect.sid");
        return res.redirect("/auth");
      });
    }
  })();