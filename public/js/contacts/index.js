window.contactsListApp = (dataList = []) =>
  new (class extends APMViewList {
    sortBy = "name";

    get filteredList() {
      let result = this.dataList;

      if (this.search.trim()) {
        const q = this.search.toLowerCase();
        result = result.filter((c) => {
          const nameMatch = c.name?.toLowerCase().includes(q);
          const emailMatch = c.emails?.some((e) =>
            (e.email || "").toLowerCase().includes(q),
          );
          const phoneMatch = c.phoneNumbers?.some((p) => p.phone?.includes(q));
          return nameMatch || emailMatch || phoneMatch;
        });
      }

      return result.sort((a, b) => {
        let valA = a[this.sortBy] || "";
        let valB = b[this.sortBy] || "";

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return this.sortAsc ? -1 : 1;
        if (valA > valB) return this.sortAsc ? 1 : -1;
        return 0;
      });
    }

    get paginatedList() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredList.slice(start, start + this.perPage);
    }

    get totalPages() {
      return Math.ceil(this.filteredList.length / this.perPage) || 1;
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
  })(dataList, 'contact');
