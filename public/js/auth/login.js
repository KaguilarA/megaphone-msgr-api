window.loginApp = () =>
  new (class {
    email = "";
    password = "";
    loading = false;

    async submitForm() {
      if (!this.email.trim() || !this.password.trim()) {
        alert("El correo y la contraseña son obligatorios.");
        return;
      }

      await forms.handleSubmit({
        state: this,
        requestFn: async () => {
          await httpRequests.post("/api/auth/login", {
            email: this.email.trim(),
            password: this.password,
          });
        },
        redirectUrl: "/contact",
        onError: (error) => {
          alert(error.message || "Error al iniciar sesión.");
        },
      });
    }
  })();