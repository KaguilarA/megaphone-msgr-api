export default (model) =>
  new (class {
    columns = [
      {
        label: "Nombre Completo",
        key: "name",
        sortable: true,
      },
      {
        label: "Teléfono",
        key: "phoneNumber",
        subKey: "phone",
        sortable: false,
      },
      {
        label: "Correos",
        key: "email",
        sortable: true,
      },
      {
        label: "Contactos",
        key: "contacts",
        type: "list",
        subKey: "contacts",
        sortable: false,
      },
    ];

    constructor(model) {
      this.model = model;
    }

    async renderHome(_req, res) {
      try {
        const dataList = await this.model.getAll({
          populate: ["address", "email", "phoneNumber", "contacts"],
        });

        res.render("user/index", {
          title: "Users",
          dataList,
          columns: this.columns,
        });
      } catch (error) {
        console.error("Error al renderizar la página de contactos:", error);
        res
          .status(500)
          .send("Error al obtener los contactos de la base de datos");
      }
    }

    async renderRegister(_req, res) {
      res.render("user/new", { title: "Registro de usuario" });
    }
  })(model);
