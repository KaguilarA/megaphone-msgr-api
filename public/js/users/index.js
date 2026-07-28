window.usersListApp = (dataList = []) =>
  new (class extends APMViewList {
    sortBy = "name";

    get searchResult() {
      return this.dataList.filter(({ name, lastname, email, phoneNumber }) => {
        const q = this.search.toLowerCase();
        const nameMatch = name.toLowerCase().includes(q);
        const lastnameMatch = lastname.toLowerCase().includes(q);
        const emailMatch = email.email.toLowerCase().includes(q);
        const phoneMatch = phoneNumber.phone.includes(q);

        return nameMatch || lastnameMatch || emailMatch || phoneMatch;
      });
    }

    async deleteContact(id) {
      if (!confirm("¿Estás seguro de que deseas eliminar este usuario?"))
        return;

      try {
        await httpRequests.delete(`${this.baseUrl}/${id}`);
        this.dataList = this.dataList.filter((c) => c._id !== id);

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
  })(dataList, "user");
