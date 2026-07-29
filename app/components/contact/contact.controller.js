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

    async renderHome(req, res) {
      try {
        res.render("contact/index", {
          title: "Contactos",
          dataList: req.user.contacts,
          columns: this.columns,
        });
      } catch (error) {
        console.error("Error al renderizar la página de contactos:", error);
        res.status(500).send("Error al obtener los contactos de la base de datos");
      }
    }

    async renderRegister(req, res) {
      res.render("contact/new", {
        title: "Nuevo Contacto",
        backUrl: "/contact",
      });
    }

    async renderEdit(req, res) {
      try {
        const { id } = req.params;

        const contact = await this.model.model
          .findById(id)
          .populate(["phoneNumbers", "emails", "addresses"])
          .lean();

        if (!contact) {
          return res.status(404).send("Contacto no encontrado");
        }

        const ownsContact = (req.user.contacts || []).some((item) => {
          const itemId = `${item._id || item.id}`;
          return itemId === id;
        });

        if (!ownsContact) {
          return res.status(404).send("Contacto no encontrado");
        }

        const normalized = { ...contact, _id: contact._id || contact.id };

        res.render("contact/edit", {
          title: "Editar Contacto",
          contact: normalized,
          backUrl: "/contact",
        });
      } catch (error) {
        console.error("Error al cargar la vista de edición:", error);
        res.status(500).send("Error al cargar la vista de edición");
      }
    }
  })(model);