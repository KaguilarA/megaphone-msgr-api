import mongoose from "mongoose";
import "../models/models.js";
import { isOperatorPermission, permissionCatalog } from "./catalog.js";

export function validateAccountInput(input = {}) {
  const { name, lastName, email, password } = input;
  if (![name, lastName, email, password].every((value) => typeof value === "string" && value.trim())) {
    throw Object.assign(new Error("Nombre, apellido, correo y contraseña son obligatorios."), { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(email.trim()) || email.length > 254) {
    throw Object.assign(new Error("Ingresa un correo electrónico válido."), { status: 400 });
  }
  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72 || password !== password.trim()) {
    throw Object.assign(new Error("Usa una contraseña de al menos 12 caracteres y hasta 72 bytes, sin espacios al inicio o al final."), { status: 400 });
  }
  if (name.trim().length > 100 || lastName.trim().length > 100) {
    throw Object.assign(new Error("El nombre y el apellido admiten hasta 100 caracteres cada uno."), { status: 400 });
  }
  return { name: name.trim(), lastName: lastName.trim(), email: email.trim().toLowerCase(), password };
}

/** All writes use the same session, including the password hashing model hooks. */
export async function createAccountInSession(input, session, { administrator = false, connection = mongoose.connection } = {}) {
  const { email, ...userData } = validateAccountInput(input);
  const { User, Email, State, Permission, UserPermission } = connection.models;
  if (await Email.findOne({ email, ownerType: "User" }).session(session)) {
    throw Object.assign(new Error("Ya existe un usuario con este correo."), { status: 409 });
  }
  const userState = await State.findOne({ entity: "User", name: "Activo" }).session(session);
  const emailState = await State.findOne({ entity: "Email", name: "Activo" }).session(session);
  if (!userState || !emailState) throw new Error("Faltan estados básicos. Ejecuta npm run setup en el servidor.");
  const references = administrator ? permissionCatalog : permissionCatalog.filter(isOperatorPermission);
  const permissions = await Permission.find({ $or: references.map(({ entity, name }) => ({ entity, name })) }).session(session);
  if (permissions.length !== references.length) throw new Error("Faltan permisos básicos. Ejecuta npm run setup en el servidor.");
  const user = await new User({ ...userData, state: userState._id }).save({ session });
  await new Email({ email, owner: user._id, ownerType: "User", state: emailState._id }).save({ session });
  await UserPermission.insertMany(permissions.map((permission) => ({ user: user._id, permission: permission._id })), { session });
  return user;
}

export async function createOperator(input) {
  const validated = validateAccountInput(input);
  return mongoose.connection.transaction((session) => createAccountInSession(validated, session));
}
