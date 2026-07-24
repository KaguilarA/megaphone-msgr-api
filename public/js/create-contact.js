window.createContactApp = function () {
  return {
    name: "",
    countryCodes: [],
    loading: false,

    // Se inicializan teléfonos con uno por defecto, pero emails y addresses vacíos
    phones: [{ countryNumber: "+506", phone: "" }],
    emails: [],
    addresses: [],

    async init() {
      this.countryCodes = await countries.getCountryCodes();
    },

    // --- Manejo Dinámico de Teléfonos ---
    addPhone() {
      forms.addListItem(this.phones, { countryNumber: "+506", phone: "" });
    },
    removePhone(index) {
      forms.removeListItem(this.phones, index, 1);
    },

    // --- Manejo Dinámico de Correos ---
    addEmail() {
      forms.addListItem(this.emails, { email: "" });
    },
    removeEmail(index) {
      forms.removeListItem(this.emails, index, 0);
    },

    // --- Manejo Dinámico de Direcciones ---
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

    // Helper de navegación seguro
    navigateBack(event) {
      if (event && typeof event.preventDefault === "function") {
        event.preventDefault();
      }
      window.location.href = "/contacts";
    },

    // --- Envío de Formulario ---
    async submitForm() {
      // 1. Limpiamos los datos ingresados
      const cleanPhones = parsers.cleanPhones(this.phones);
      const cleanEmails = parsers.cleanEmails(this.emails);
      const cleanAddresses = parsers.cleanAddresses(this.addresses);

      if (!this.name.trim() || cleanPhones.length === 0) {
        alert("El nombre y al menos un teléfono válido son obligatorios.");
        return;
      }

      await forms.handleSubmit({
        state: this,
        requestFn: async () => {
          // 2. Crear subdocumentos en paralelo en la BD para obtener sus ObjectIds
          const [createdPhones, createdEmails, createdAddresses] =
            await Promise.all([
              Promise.all(
                cleanPhones.map((p) =>
                  httpRequests.post("/api/phone-numbers", p),
                ),
              ),
              Promise.all(
                cleanEmails.map((e) => httpRequests.post("/api/emails", e)),
              ),
              Promise.all(
                cleanAddresses.map((a) =>
                  httpRequests.post("/api/addresses", a),
                ),
              ),
            ]);

          // 3. Mapear las respuestas para extraer únicamente los IDs generados
          const payload = {
            name: this.name.trim(),
            phoneNumbers: createdPhones.map((p) => p._id || p.id),
            emails: createdEmails.map((e) => e._id || e.id),
            addresses: createdAddresses.map((a) => a._id || a.id),
          };

          // 4. Crear el Contacto relacionando los ObjectIds
          return httpRequests.post("/api/contacts", payload);
        },
        redirectUrl: "/contacts",
      });
    },
  };
};
