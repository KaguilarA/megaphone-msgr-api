window.editUserApp = (initialData = {}) =>
  new (class {
    name = initialData.name || "";
    lastname = initialData.lastname || "";
    password = "";
    countryCodes = [];
    loading = false;

    phones = initialData.phoneNumber
      ? [
          {
            countryNumber: initialData.phoneNumber.countryNumber || "+506",
            phone: initialData.phoneNumber.phone || "",
            _id: initialData.phoneNumber._id || initialData.phoneNumber.id,
          },
        ]
      : [{ countryNumber: "+506", phone: "" }];

    emails = initialData.email
      ? [
          {
            email: initialData.email.email || "",
            _id: initialData.email._id || initialData.email.id,
          },
        ]
      : [{ email: "" }];

    addresses = initialData.addresses
      ? initialData.addresses.map((address) => ({
          _id: address._id || address.id,
          street: address.street || "",
          city: address.city || "",
          state: address.state || "",
          postalCode: address.postalCode || "",
          country: address.country || "Costa Rica",
        }))
      : [];

    async init() {
      this.countryCodes = await countries.getCountryCodes();
    }

    async submitForm() {
      const cleanPhones = parsers.cleanPhones(this.phones);
      const cleanEmails = parsers.cleanEmails(this.emails);
      const cleanAddresses = parsers.cleanAddresses(this.addresses);

      if (!this.name.trim() || !this.lastname.trim() || cleanPhones.length === 0) {
        alert(
          "El nombre, apellido y al menos un teléfono válido son obligatorios.",
        );
        return;
      }

      await forms.handleSubmit({
        state: this,
        requestFn: async () => {
          const [updatedPhones, updatedEmails, updatedAddresses] =
            await Promise.all([
              Promise.all(
                cleanPhones.map(async (phone) => {
                  if (phone._id) {
                    return httpRequests.put(`/api/phone-number/${phone._id}`, phone);
                  }
                  return httpRequests.post("/api/phone-number", phone);
                }),
              ),
              Promise.all(
                cleanEmails.map(async (email) => {
                  if (email._id) {
                    return httpRequests.put(`/api/email/${email._id}`, email);
                  }
                  return httpRequests.post("/api/email", email);
                }),
              ),
              Promise.all(
                cleanAddresses.map(async (address) => {
                  if (address._id) {
                    return httpRequests.put(`/api/address/${address._id}`, address);
                  }
                  return httpRequests.post("/api/address", address);
                }),
              ),
            ]);

          const payload = {
            name: this.name.trim(),
            lastname: this.lastname.trim(),
            password: this.password.trim() || undefined,
            email: updatedEmails[0]._id || updatedEmails[0].id,
            phoneNumber: updatedPhones[0]._id || updatedPhones[0].id,
            addresses: updatedAddresses.map((a) => a._id || a.id),
          };

          return httpRequests.put(`/api/user/${initialData._id}`, payload);
        },
        redirectUrl: "/user",
      });
    }

    addAddress() {
      if (this.addresses.length === 0) {
        forms.addListItem(this.addresses, {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "Costa Rica",
        });
      }
    }

    navigateBack() {
      window.location.href = "/user";
    }

    removeAddress(index) {
      forms.removeListItem(this.addresses, index, 0);
    }
  })(initialData);