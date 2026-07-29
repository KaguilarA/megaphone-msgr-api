window.registerApp = () =>
  new (class {
    name = "";
    lastname = "";
    registerEmail = "";
    registerPhone = "";
    password = "";
    loading = false;

    async submitForm() {
      if (
        !this.name.trim() ||
        !this.lastname.trim() ||
        !this.registerEmail.trim() ||
        !this.registerPhone.trim() ||
        !this.password.trim()
      ) {
        alert("Todos los campos de registro son obligatorios.");
        return;
      }

      await forms.handleSubmit({
        state: this,
        requestFn: async () => {
          const emailPayload = {
            email: this.registerEmail.trim().toLowerCase(),
          };
          const phonePayload = {
            phone: this.registerPhone.trim(),
          };

          const [createdPhone, createdEmail] = await Promise.all([
            httpRequests.post("/api/phone-number", phonePayload),
            httpRequests.post("/api/email", emailPayload),
          ]);

          const payload = {
            name: this.name.trim(),
            lastname: this.lastname.trim(),
            password: this.password,
            email: createdEmail._id || createdEmail.id,
            phoneNumber: createdPhone._id || createdPhone.id,
          };

          await httpRequests.post("/api/user", payload);
        },
        redirectUrl: "/auth",
        onError: (error) => {
          alert(error.message || "Error al registrar usuario.");
        },
      });
    }

    navigateBack() {
      window.location.href = "/auth";
    }
  })();
