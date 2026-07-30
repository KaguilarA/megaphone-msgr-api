window.userTokenApp = (initialData = {}) =>
  new (class {
    emailToken = initialData.emailToken || "";
    waToken = initialData.waToken || "";
    telegramToken = initialData.telegramToken || "";
    userTokenId =
      initialData.userTokens?._id || initialData.userTokens?.id || "";
    loading = false;

    async submitForm() {
      await forms.handleSubmit({
        state: this,
        requestFn: async () => {
          const payload = {
            userTokens: {
              _id: this.userTokenId,
              emailToken: this.emailToken.trim(),
              whatsappToken: this.waToken.trim(),
              telegramToken: this.telegramToken.trim(),
            },
          };

          return httpRequests.put(`/api/user/${initialData._id}`, payload);
        },
        redirectUrl: "/user",
      });
    }

    navigateBack() {
      window.location.href = "/user";
    }
  })(initialData);
