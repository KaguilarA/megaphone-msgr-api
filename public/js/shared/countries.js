const countries = new (class {
  async getCountryCodes() {
    try {
      return await window.httpRequests.get("/countries");
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
