window.editContactApp = (initialData = {}) =>
  new (class {
    countryCodes = [];
    loading = false;

    constructor(initialData) {
      this.id = initialData._id;
      this.name = initialData.name;
      this.lastname = initialData.lastname;
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
    }
  })(initialData);