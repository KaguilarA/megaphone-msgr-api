document.addEventListener("DOMContentLoaded", () => {
  loadContacts();
});

async function loadContacts() {
  const loadingState = document.getElementById("loadingState");
  const tableContainer = document.getElementById("tableContainer");
  const tbody = document.getElementById("contactsTableBody");

  try {
    // Asegúrate de que esta ruta coincida con tu endpoint en Express (p. ej., /api/contact o /api/contacts)
    const response = await fetch("/api/contact");

    if (!response.ok) {
      throw new Error(`Error en la respuesta de la API: ${response.status}`);
    }

    const contacts = await response.json();

    // Si todo va bien, ocultamos la alerta de "Cargando..."
    loadingState.classList.add("d-none");

    if (!contacts || contacts.length === 0) {
      // Muestra un mensaje si no hay contactos
      loadingState.textContent = "No hay contactos registrados aún.";
      loadingState.classList.remove("alert-info", "d-none");
      loadingState.classList.add("alert-warning");
      return;
    }

    // Renderizar filas
    tbody.innerHTML = contacts.map((contact) => renderRow(contact)).join("");

    // Mostrar la tabla
    tableContainer.classList.remove("d-none");
  } catch (error) {
    console.error("Error al cargar contactos:", error);
    loadingState.textContent =
      "Ocurrió un error al cargar los contactos. Revisa la consola o la BD.";
    loadingState.classList.remove("alert-info");
    loadingState.classList.add("alert-danger");
  }
}

function renderRow(contact) {
  const phones =
    contact.phoneNumbers && contact.phoneNumbers.length > 0
      ? `<ul class="list-unstyled">${contact.phoneNumbers.map((p) => `<li><span class="badge">${p.type || "Tel"}</span>${p.number || ""}</li>`).join("")}</ul>`
      : `<span class="text-muted">Sin teléfonos</span>`;

  const emails =
    contact.email && contact.email.length > 0
      ? `<ul class="list-unstyled">${contact.email.map((e) => `<li><a href="mailto:${e.address}">${e.address}</a></li>`).join("")}</ul>`
      : `<span class="text-muted">Sin correos</span>`;

  const addresses =
    contact.idAddress && contact.idAddress.length > 0
      ? `<ul class="list-unstyled">${contact.idAddress.map((a) => `<li>${a.street || ""}, ${a.city || ""}</li>`).join("")}</ul>`
      : `<span class="text-muted">Sin direcciones</span>`;

  return `
    <tr>
      <td><strong>${contact.name || "Sin nombre"}</strong></td>
      <td>${phones}</td>
      <td>${emails}</td>
      <td>${addresses}</td>
      <td>
        <div class="actions-cell">
          <a class="btn btn-outline-warning" href="/contacts/${contact._id}/edit">Editar</a>
          <button class="btn btn-outline-danger" onclick="deleteContact('${contact._id}')">Eliminar</button>
        </div>
      </td>
    </tr>
  `;
}

async function deleteContact(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este contacto?")) return;

  try {
    const res = await fetch(`/api/contact/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadContacts();
    } else {
      alert("Error al eliminar el contacto.");
    }
  } catch (error) {
    console.error("Error al eliminar:", error);
  }
}