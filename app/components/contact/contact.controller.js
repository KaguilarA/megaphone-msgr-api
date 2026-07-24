import ContactModel from "./../../../db/models/contact.model.js";

const POPULATE_FIELDS = ["addresses", "emails", "phoneNumbers"];

export const loadCountries = async (_req, res) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500); // Max 2.5s de espera

  try {
    const response = await fetch(
      "https://countriesnow.space/api/v0.1/countries/codes",
      {
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error en API de países: ${response.status}`);
    }

    const result = await response.json();

    const countries = result.data
      .map((c) => ({
        code: c.code,
        idd: c.dial_code,
      }))
      .filter((c) => c.idd && c.code)
      .sort((a, b) => a.code.localeCompare(b.code));

    res.status(200).json(countries);
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn("API de países falló o expiró. Cargando lista de respaldo.");

    // Fallback por defecto si la API falla o excede tiempo
    res.status(200).json([
      { code: "CR", idd: "+506" },
      { code: "US", idd: "+1" },
      { code: "MX", idd: "+52" },
      { code: "ES", idd: "+34" },
      { code: "AR", idd: "+54" },
      { code: "CO", idd: "+57" },
    ]);
  }
};

export const renderContactsPage = async (_req, res) => {
  try {
    const contacts = await ContactModel.getAll({ populate: POPULATE_FIELDS });

    res.render("contacts/index", {
      title: "Contactos",
      contacts,
      contactColumns: [
        { label: "Nombre Completo", key: "name", sortable: true },
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
      ],
    });
  } catch (error) {
    console.error("Error al renderizar la página de contactos:", error);
    res.status(500).send("Error al obtener los contactos de la base de datos");
  }
};

export const renderNewContactPage = (_req, res) => {
  res.render("contacts/new", { title: "Nuevo Contacto" });
};

export const renderEditContactView = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await ContactModel.getById(id, {
      populate: POPULATE_FIELDS,
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
};
