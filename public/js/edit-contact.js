window.editContactApp = function (initialData = {}) {
  return {
    id: initialData._id || initialData.id,
    name: initialData.name || "",
    countryCodes: [],
    loading: false,

    phones:
      initialData.phoneNumbers && initialData.phoneNumbers.length
        ? initialData.phoneNumbers
        : [{ countryNumber: "+506", phone: "" }],

    emails:
      initialData.emails && initialData.emails.length
        ? initialData.emails.map((e) => ({
            _id: e._id,
            email: e.email || "",
          }))
        : [{ email: "" }],

    addresses:
      initialData.addresses && initialData.addresses.length
        ? initialData.addresses
        : [
            {
              street: "",
              city: "",
              state: "",
              postalCode: "",
              country: "Costa Rica",
            },
          ],

    async init() {
      // Carga la lista de códigos de país compartida
      this.countryCodes = await countries.getCountryCodes();
    },

    // --- Manejo dinámico de filas usando 'forms' ---
    addPhone() {
      forms.addListItem(this.phones, { countryNumber: "+506", phone: "" });
    },
    removePhone(index) {
      forms.removeListItem(this.phones, index, 1);
    },

    addEmail() {
      forms.addListItem(this.emails, { email: "" });
    },
    removeEmail(index) {
      forms.removeListItem(this.emails, index, 0);
    },

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

    navigateBack() {
      window.location.href = "/contacts";
    },

    // --- Envío de Formulario ---
    async submitForm() {
      const payload = {
        name: this.name.trim(),
        phoneNumbers: parsers.cleanPhones(this.phones),
        emails: parsers.cleanEmails(this.emails),
        addresses: parsers.cleanAddresses(this.addresses),
      };

      await forms.handleSubmit({
        state: this,
        requestFn: () => httpRequests.put(`/api/${this.id}`, payload),
        redirectUrl: "/contacts",
      });
    },
  };
};
