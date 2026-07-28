window.contactsListApp = (dataList = []) =>
  new (class extends APMViewList {
    sortBy = "name";

    get searchResult() {
      const q = this.search.toLowerCase();

      return this.dataList.filter((c) => {
        const nameMatch = c.name?.toLowerCase().includes(q);
        const emailMatch = c.emails?.some((e) =>
          (e.email || "").toLowerCase().includes(q),
        );
        const phoneMatch = c.phoneNumbers?.some((p) => p.phone?.includes(q));
        return nameMatch || emailMatch || phoneMatch;
      });
    }

    async deleteContact(id) {
      if (!confirm("¿Estás seguro de que deseas eliminar este contacto?"))
        return;

      try {
        await httpRequests.delete(`${this.baseUrl}${id}`);
        this.dataList = this.dataList.filter((c) => c._id !== id);

        if (this.paginatedList.length === 0 && this.currentPage > 1) {
          this.currentPage--;
        }
      } catch (error) {
        console.error("Error al eliminar contacto:", error);
        alert(
          `Error al eliminar: ${error.message || "No se pudo completar la acción"}`,
        );
      }
    }
  })(dataList, "contact");
