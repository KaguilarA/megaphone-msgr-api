window.createContactApp = () =>
  new (class {
    name = "";
    countryCodes = [];
    loading = false;

    phones = [{ countryNumber: "+506", phone: "" }];
    emails = [];
    addresses = [];

    async init() {
      this.countryCodes = await countries.getCountryCodes();
    }

    async submitForm() {
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
          const [createdPhones, createdEmails, createdAddresses] =
            await Promise.all([
              Promise.all(
                cleanPhones.map((p) =>
                  httpRequests.post("/api/phone-number", p),
                ),
              ),
              Promise.all(
                cleanEmails.map((e) => httpRequests.post("/api/email", e)),
              ),
              Promise.all(
                cleanAddresses.map((a) => httpRequests.post("/api/address", a)),
              ),
            ]);

          const payload = {
            name: this.name.trim(),
            phoneNumbers: createdPhones.map((p) => p._id || p.id),
            emails: createdEmails.map((e) => e._id || e.id),
            addresses: createdAddresses.map((a) => a._id || a.id),
          };

          return httpRequests.post("/api/contact", payload);
        },
        redirectUrl: "/contact",
      });
    }

    addAddress() {
      forms.addListItem(this.addresses, {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Costa Rica",
      });
    }

    addEmail() {
      forms.addListItem(this.emails, { email: "" });
    }

    addPhone() {
      forms.addListItem(this.phones, { countryNumber: "+506", phone: "" });
    }

    navigateBack() {
      window.location.href = "/contact";
    }

    removeAddress(index) {
      forms.removeListItem(this.addresses, index, 0);
    }

    removeEmail(index) {
      forms.removeListItem(this.emails, index, 0);
    }

    removePhone(index) {
      forms.removeListItem(this.phones, index, 1);
    }
  })();
