document.addEventListener("DOMContentLoaded", () => {

  document.addEventListener("click", async (e) => {
    if (e.target.matches(".delete-btn")) {
      const btn = e.target;
      const contactId = btn.dataset.id;

      if (!confirm("¿Estás seguro de que deseas eliminar este contacto?")) {
        return;
      }

      try {
        btn.disabled = true;
        const res = await fetch(`/api/contact/${contactId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          // Remover la fila del DOM suavemente
          const row = btn.closest("tr");
          row.remove();
        } else {
          const errData = await res.json();
          alert(
            `Error al eliminar: ${errData.message || "No se pudo completar la acción"}`,
          );
          btn.disabled = false;
        }
      } catch (error) {
        console.error("Error al eliminar contacto:", error);
        alert("Ocurrió un error al intentar eliminar el contacto.");
        btn.disabled = false;
      }
    }
  });
});
