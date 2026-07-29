export default () =>
  new (class {
    renderHome(req, res) {
      res.render("auth/index", { title: "Iniciar sesion" });
    }
  })();