const countries = new (class {
  countries = [];

  async getCountryCodes() {
    try {
      const data = await httpRequests.get("/countries");
      return data;
    } catch (error) {
      console.warn("Usando fallback local para códigos de país");
      return [
        { code: "CR", idd: "+506" },
        { code: "US", idd: "+1" },
        { code: "MX", idd: "+52" },
      ];
    }
  }
})();
