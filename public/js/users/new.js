window.createUserApp = () =>
  new (class {
    name = "";
    lastname = "";
    password = "";
    emailToken = "";
    waToken = "";
    telegramToken = "";
    countryCodes = [];
    loading = false;

    phones = [{ countryNumber: "+506", phone: "" }];
    // email y address son únicos (no arreglos en el esquema de User)
    emails = [{ email: "" }];
    addresses = [];

    async init() {
      this.countryCodes = await countries.getCountryCodes();
    }

    async submitForm() {
      const cleanPhones = parsers.cleanPhones(this.phones);
      const cleanEmails = parsers.cleanEmails(this.emails);
      const cleanAddresses = parsers.cleanAddresses(this.addresses);

      if (
        !this.name.trim() ||
        !this.lastname.trim() ||
        !this.password.trim() ||
        cleanPhones.length === 0
      ) {
        alert(
          "El nombre, apellido, contraseña y al menos un teléfono válido son obligatorios.",
        );
        return;
      }

      await forms.handleSubmit({
        state: this,
        requestFn: async () => {
          // Crear las sub-entidades requeridas en paralelo
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
            lastname: this.lastname.trim(),
            password: this.password.trim(),
            emailToken: this.emailToken.trim() || undefined,
            waToken: this.waToken.trim() || undefined,
            telegramToken: this.telegramToken.trim() || undefined,
            phoneNumber: createdPhones[0]
              ? createdPhones[0]._id || createdPhones[0].id
              : undefined,
            email: createdEmails[0]
              ? createdEmails[0]._id || createdEmails[0].id
              : undefined,
            address: createdAddresses[0]
              ? createdAddresses[0]._id || createdAddresses[0].id
              : undefined,
          };

          return httpRequests.post("/api/user", payload);
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
  })();
