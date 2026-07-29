export default (model) =>
  new (class {
    columns = [
      {
        label: "Nombre",
        key: "name",
        sortable: true,
      },
      {
        label: "Apellido",
        key: "lastname",
        sortable: true,
      },
      {
        label: "Teléfono",
        key: "phoneNumber",
        type: "data",
        subKey: "phone",
        sortable: true,
      },
      {
        label: "Correo",
        key: "email",
        type: "data",
        subKey: "email",
        sortable: true,
      },
      {
        label: "Contactos",
        key: "contacts",
        type: "list",
        subKey: "name",
        sortable: false,
      },
    ];

    constructor(model) {
      this.model = model;
    }

    async renderHome(_req, res) {
      try {
        const response = await fetch("http://localhost:3000/api/user");
        const dataList = await response.json();

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
