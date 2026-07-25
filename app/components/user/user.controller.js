export default (model) =>
  new (class {
    columns = [
      {
        label: "Nombre Completo",
        key: "name",
        sortable: true,
      },
      {
        label: "Teléfonos",
        key: "phoneNumbers",
        type: "list",
        subKey: "phone",
        sortable: false,
      },
      {
        label: "Correos",
        key: "emails",
        type: "list",
        subKey: "email",
        sortable: false,
      },
    ];

    constructor(model) {
      this.model = model;
    }

    async renderRegister(_req, res) {
      res.render("user/new", { title: "Registro de usuario" });
    }
  })(model);
