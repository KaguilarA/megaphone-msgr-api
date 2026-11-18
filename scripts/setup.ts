import mongoose from "mongoose";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { stdin, stdout } from "node:process";
import validateConfig from "../utils/validateConfig.js";

async function secret(prompt) {
  stdout.write(prompt);
  const sink = new Writable({ write(_chunk, _encoding, done) { done(); } });
  const reader = createInterface({ input: stdin, output: sink, terminal: true });
  try { return await reader.question(""); }
  finally { reader.close(); stdout.write("\n"); }
}

async function credentials() {
  if (process.env.SETUP_ADMIN_EMAIL) {
    return { name: process.env.SETUP_ADMIN_NAME, lastName: process.env.SETUP_ADMIN_LAST_NAME,
      email: process.env.SETUP_ADMIN_EMAIL, password: process.env.SETUP_ADMIN_PASSWORD };
  }
  if (!stdin.isTTY) throw Object.assign(new Error("Usa una terminal interactiva o las variables SETUP_ADMIN_NAME, SETUP_ADMIN_LAST_NAME, SETUP_ADMIN_EMAIL y SETUP_ADMIN_PASSWORD."), { code: "INPUT_REQUIRED" });
  const reader = createInterface({ input: stdin, output: stdout });
  let account;
  try {
    account = { name: await reader.question("Nombre del administrador: "),
      lastName: await reader.question("Apellido: "), email: await reader.question("Correo electrónico: ") };
  } finally { reader.close(); }
  account.password = await secret("Contraseña (mínimo 12 caracteres; no se mostrará): ");
  if (account.password !== await secret("Confirma la contraseña: ")) {
    throw Object.assign(new Error("Las contraseñas no coinciden."), { code: "INPUT_REQUIRED" });
  }
  return account;
}

if (process.argv.includes("--help")) {
  console.log("npm run setup\nInicializa una base vacía y crea el primer administrador. Requiere .env configurado y MongoDB con replica set o clúster compatible con transacciones. Una segunda ejecución conserva el administrador y su contraseña. No importa los archivos db/*.json.");
} else {
  try {
    validateConfig();
    await import("../models/models.js");
    const { bootstrapInstallation, INSTALLATION_ID } = await import("../setup/bootstrap.js");
    const { validateAccountInput } = await import("../setup/accounts.js");
    await mongoose.connect(process.env.DB_HOST, { autoIndex: false, serverSelectionTimeoutMS: 10000 });
    const installation = await mongoose.models.Installation.findById(INSTALLATION_ID);
    if (!installation?.completedAt && await mongoose.models.User.exists({})) {
      throw Object.assign(new Error("La base ya contiene usuarios. Este comando no promueve cuentas existentes; consulta docs/first-install.md."), { code: "EXISTING_INSTALLATION" });
    }
    const account = installation?.completedAt ? undefined : validateAccountInput(await credentials());
    // Collections and unique indexes must exist before starting the installation transaction.
    for (const model of Object.values(mongoose.models)) {
      await model.createCollection();
      await model.createIndexes();
    }
    const result = await bootstrapInstallation(account);
    console.log(result.created ? "Instalación completada. Inicia sesión con el administrador que acabas de crear." :
      "La instalación ya estaba completada. Se conservaron la cuenta, la contraseña y sus permisos; se verificaron los catálogos básicos.");
  } catch (error) {
    const safe = error.status || ["INPUT_REQUIRED", "EXISTING_INSTALLATION"].includes(error.code) || error.message?.startsWith("Invalid application configuration.");
    console.error(safe ? error.message : error.code === 20 ? "La instalación requiere MongoDB con transacciones: configura un replica set o utiliza un clúster administrado." :
      error.code === 11000 ? "Hay datos duplicados que impiden crear los índices únicos. No se creó el administrador." :
      `No se pudo completar la instalación (${error.name}). Revisa la conexión y los requisitos de docs/first-install.md.`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
