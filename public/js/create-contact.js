window.createContactApp = function () {
  return {
    name: "",
    countryCodes: [],
    loading: false,

    // Estructura inicial alineada con las secciones dinámicas de Pug
    phones: [{ countryNumber: "+506", phone: "" }],
    emails: [{ email: "" }],
    addresses: [
      {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Costa Rica",
      },
    ],

    async init() {
      // Consume el singleton estático de países
      this.countryCodes = await countries.getCountryCodes();
    },

    // --- Manejo de Teléfonos ---
    addPhone() {
      forms.addListItem(this.phones, { countryNumber: "+506", phone: "" });
    },
    removePhone(index) {
      forms.removeListItem(this.phones, index, 1);
    },

    // --- Manejo de Correos ---
    addEmail() {
      forms.addListItem(this.emails, { email: "" });
    },
    removeEmail(index) {
      forms.removeListItem(this.emails, index, 0);
    },

    // --- Manejo de Direcciones ---
    addAddress() {
      forms.addListItem(this.addresses, {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Costa Rica",
      });
    },
    removeAddress(index) {
      forms.removeListItem(this.addresses, index, 0);
    },

    // --- Envío del Formulario ---
    async submitForm() {
      // Limpiamos los arrays dinámicos usando parsers antes de estructurar el payload
      const payload = {
        name: this.name,
        phoneNumbers: parsers.cleanPhones(this.phones),
        emails: parsers.cleanEmails(this.emails),
        addresses: parsers.cleanAddresses(this.addresses),
      };

      // Delegamos la petición y gestión del estado de carga a forms y httpRequests
      await forms.handleSubmit({
        state: this,
        requestFn: () => httpRequests.post("/contacts", payload),
        redirectUrl: "/contacts",
      });
    },
  };
};
