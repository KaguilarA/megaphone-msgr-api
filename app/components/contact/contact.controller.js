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
        const contacts = await this.model.getAll({
          populate: ["addresses", "emails", "phoneNumbers"],
        });

        res.render("contacts/index", {
          title: "Contactos",
          contacts,
          contactColumns: this.columns,
        });
      } catch (error) {
        console.error("Error al renderizar la página de contactos:", error);
        res
          .status(500)
          .send("Error al obtener los contactos de la base de datos");
      }
    }

    async renderRegister(_req, res) {
      res.render("contacts/new", { title: "Nuevo Contacto" });
    }

    async renderEdit(req, res) {
      try {
        const { id } = req.params;
        const contact = await this.model.getById(id, {
          populate: ["addresses", "emails", "phoneNumbers"],
        });

        if (!contact) {
          res.status(404).send("Contacto no encontrado");
          return;
        }

        res.render("contacts/edit", {
          title: "Editar Contacto",
          contact,
        });
      } catch (error) {
        console.error("Error al cargar la vista de edición:", error);
        res.status(500).send("Error al cargar la vista de edición");
      }
    }
  })(model);