document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");

  document.getElementById("addPhoneBtn").addEventListener("click", addPhoneRow);
  document.getElementById("addEmailBtn").addEventListener("click", addEmailRow);
  document
    .getElementById("addAddressBtn")
    .addEventListener("click", addAddressRow);

  form.addEventListener("submit", handleFormSubmit);
});

function addPhoneRow() {
  const container = document.getElementById("phonesContainer");
  const row = document.createElement("div");
  row.className = "dynamic-row grid-3";
  row.innerHTML = `
    <div class="form-group">
      <label>Número *</label>
      <input type="text" class="form-control phone-number" required placeholder="+506 8888 8888">
    </div>
    <div class="form-group">
      <label>Tipo</label>
      <input type="text" class="form-control phone-type" placeholder="Móvil, Casa, Trabajo">
    </div>
    <button type="button" class="btn btn-outline-danger btn-sm remove-row-btn" onclick="this.parentElement.remove()">Eliminar</button>
  `;
  container.appendChild(row);
}

function addEmailRow() {
  const container = document.getElementById("emailsContainer");
  const row = document.createElement("div");
  row.className = "dynamic-row grid-2";
  row.innerHTML = `
    <div class="form-group">
      <label>Correo Electrónico *</label>
      <input type="email" class="form-control email-address" required placeholder="correo@ejemplo.com">
    </div>
    <button type="button" class="btn btn-outline-danger btn-sm remove-row-btn" onclick="this.parentElement.remove()">Eliminar</button>
  `;
  container.appendChild(row);
}

function addAddressRow() {
  const container = document.getElementById("addressesContainer");
  const row = document.createElement("div");
  row.className = "dynamic-row grid-3";
  row.innerHTML = `
    <div class="form-group">
      <label>Calle *</label>
      <input type="text" class="form-control address-street" required placeholder="Calle Principal">
    </div>
    <div class="form-group">
      <label>Ciudad *</label>
      <input type="text" class="form-control address-city" required placeholder="San José">
    </div>
    <button type="button" class="btn btn-outline-danger btn-sm remove-row-btn" onclick="this.parentElement.remove()">Eliminar</button>
  `;
  container.appendChild(row);
}

async function handleFormSubmit(e) {
  e.preventDefault();

  try {
    // 1. Crear subdocumentos de Teléfonos
    const phoneNodes = document.querySelectorAll(
      "#phonesContainer .dynamic-row",
    );
    const phoneIds = [];
    for (const node of phoneNodes) {
      const number = node.querySelector(".phone-number").value;
      const type = node.querySelector(".phone-type").value;
      const res = await fetch("/api/phone-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number, type }),
      });
      const data = await res.json();
      phoneIds.push(data._id);
    }

    // 2. Crear subdocumentos de Correos
    const emailNodes = document.querySelectorAll(
      "#emailsContainer .dynamic-row",
    );
    const emailIds = [];
    for (const node of emailNodes) {
      const address = node.querySelector(".email-address").value;
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      emailIds.push(data._id);
    }

    // 3. Crear subdocumentos de Direcciones
    const addressNodes = document.querySelectorAll(
      "#addressesContainer .dynamic-row",
    );
    const addressIds = [];
    for (const node of addressNodes) {
      const street = node.querySelector(".address-street").value;
      const city = node.querySelector(".address-city").value;
      const res = await fetch("/api/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ street, city }),
      });
      const data = await res.json();
      addressIds.push(data._id);
    }

    // 4. Crear el Contacto alineado exactamente al Mongoose Schema
    const contactPayload = {
      name: document.getElementById("name").value,
      phoneNumbers: phoneIds,
      email: emailIds,
      idAddress: addressIds,
    };

    const contactRes = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactPayload),
    });

    if (contactRes.ok) {
      window.location.href = "/contacts";
    } else {
      alert("Error al registrar el contacto");
    }
  } catch (error) {
    console.error("Error durante el registro:", error);
    alert("Ocurrió un error al procesar la solicitud.");
  }
}
