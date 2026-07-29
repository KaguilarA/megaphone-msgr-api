window.editContactApp = (initialData = {}) =>
  new (class {
    countryCodes = [];
    loading = false;
    backUrl = "/contact";

    constructor(initialData) {
      this.id = initialData._id;
      this.backUrl = initialData.backUrl || this.backUrl;
      this.name = initialData.name || "";
      this.addresses =
        initialData.addresses && initialData.addresses.length
          ? initialData.addresses.map((a) => ({
              _id: a._id || a.id,
              street: a.street || "",
              city: a.city || "",
              state: a.state || "",
              postalCode: a.postalCode || "",
              country: a.country || "Costa Rica",
            }))
          : [];
      this.emails =
        initialData.emails && initialData.emails.length
          ? initialData.emails.map((e) => ({
              _id: e._id || e.id,
              email: e.email || "",
            }))
          : [];
      this.phones =
        initialData.phoneNumbers && initialData.phoneNumbers.length
          ? initialData.phoneNumbers
          : [{ countryNumber: "+506", phone: "" }];

      this.init();
    }

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
          const [updatedPhones, updatedEmails, updatedAddresses] =
            await Promise.all([
              Promise.all(
                cleanPhones.map((p) => {
                  const subId = p._id || p.id;
                  if (subId) {
                    return httpRequests.put(`/api/phone-number/${subId}`, p);
                  }
                  return httpRequests.post("/api/phone-number", p);
                }),
              ),
              Promise.all(
                cleanEmails.map((e) => {
                  const subId = e._id || e.id;
                  if (subId) {
                    return httpRequests.put(`/api/email/${subId}`, e);
                  }
                  return httpRequests.post("/api/email", e);
                }),
              ),
              Promise.all(
                cleanAddresses.map((a) => {
                  const subId = a._id || a.id;
                  if (subId) {
                    return httpRequests.put(`/api/address/${subId}`, a);
                  }
                  return httpRequests.post("/api/address", a);
                }),
              ),
            ]);

          const payload = {
            name: this.name.trim(),
            phoneNumbers: updatedPhones.map((p) => p._id || p.id),
            emails: updatedEmails.map((e) => e._id || e.id),
            addresses: updatedAddresses.map((a) => a._id || a.id),
          };

          return httpRequests.put(`/api/contact/${this.id}`, payload);
        },
        redirectUrl: this.backUrl,
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

    navigateBack(event) {
      if (event && typeof event.preventDefault === "function") {
        event.preventDefault();
      }
      window.location.href = this.backUrl;
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
  })(initialData);
