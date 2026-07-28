window.contactsListApp = (dataList = []) =>
  new (class {
    currentPage = 1;
    search = "";
    sortAsc = true;
    sortBy = "name";
    perPage = 5;

    get filteredList() {
      let result = this.list;

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

    constructor(list = []) {
      this.list = list;
    }

    async deleteContact(id) {
      if (!confirm("¿Estás seguro de que deseas eliminar este usuario?"))
        return;

      try {
        await httpRequests.delete(`/api/contact/${id}`);
        this.list = this.list.filter((c) => c._id !== id);

        if (this.paginatedList.length === 0 && this.currentPage > 1) {
          this.currentPage--;
        }
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        alert(
          `Error al eliminar: ${error.message || "No se pudo completar la acción"}`,
        );
      }
    }

    navigateToAdd() {
      window.location.href = "/user/new";
    }

    navigateToEdit(id) {
      window.location.href = `/user/${id}/edit`;
    }

    setPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    }

    sort(column) {
      if (this.sortBy === column) {
        this.sortAsc = !this.sortAsc;
      } else {
        this.sortBy = column;
        this.sortAsc = true;
      }
    }
  })(dataList);
