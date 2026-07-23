function renderRow(contact) {
  const phones =
    contact.phoneNumbers && contact.phoneNumbers.length > 0
      ? `<ul class="list-unstyled">${contact.phoneNumbers.map((p) => `<li><span class="badge">${p.type || "Tel"}</span>${p.number}</li>`).join("")}</ul>`
      : `<span class="text-muted">Sin teléfonos</span>`;

  const emails =
    contact.emails && contact.emails.length > 0
      ? `<ul class="list-unstyled">${contact.emails.map((e) => `<li><a href="mailto:${e.address}">${e.address}</a></li>`).join("")}</ul>`
      : `<span class="text-muted">Sin correos</span>`;

  const addresses =
    contact.addresses && contact.addresses.length > 0
      ? `<ul class="list-unstyled">${contact.addresses.map((a) => `<li>${a.street}, ${a.city}</li>`).join("")}</ul>`
      : `<span class="text-muted">Sin direcciones</span>`;

  return `
    <tr>
      <td><strong>${contact.firstName || ""} ${contact.lastName || ""}</strong></td>
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
