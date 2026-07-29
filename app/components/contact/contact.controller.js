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

    async renderHome(_req, res) {
      try {
        const response = await fetch("http://localhost:3000/api/contact");
        const dataList = await response.json();

        res.render("contact/index", {
          title: "Contactos",
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
      res.render("contact/new", { title: "Nuevo Contacto" });
    }

    async renderEdit(req, res) {
      try {
        const { id } = req.params;
        const response = await fetch(`http://localhost:3000/api/contact/${id}`);
        const contact = await response.json();

        res.render("contact/edit", {
          title: "Editar Contacto",
          contact,
        });
      } catch (error) {
        console.error("Error al cargar la vista de edición:", error);
        res.status(500).send("Error al cargar la vista de edición");
      }
    }
  })(model);