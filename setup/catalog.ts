// Stable application data, independent of exported customer/user database snapshots.
const actions = {
  ActionLog: ["getAll", "getById"],
  Address: ["getDataById", "getDataForContact", "getDataForUser", "registerForContact", "registerForUser", "updateDataById", "deleteDataById"],
  Contact: ["getById", "getAll", "register", "updateById", "deleteById"],
  Email: ["getDataById", "getDataForContact", "getDataForUser", "registerForContact", "registerForUser", "updateDataById", "deleteDataById"],
  Message: ["getAll", "getById", "register"],
  Phone: ["getDataById", "getDataForContact", "getDataForUser", "registerForContact", "registerForUser", "updateDataById", "deleteDataById"],
  State: ["getAll", "getByCoincidence", "register"],
  Token: ["register", "getById", "update", "delete"],
  User: ["getAll", "getById", "getInfo", "getPermissions", "updatePermissions", "register", "update"],
};

export const permissionCatalog = Object.entries(actions).flatMap(([entity, names]) =>
  names.map((name) => ({ entity, name, description: `${entity}: ${name}` })),
);

export function isOperatorPermission({ entity, name }) {
  if (entity === "User") return ["getInfo", "update"].includes(name);
  if (entity === "State") return ["getAll", "getByCoincidence"].includes(name);
  return ["Address", "Contact", "Email", "Message", "Phone", "Token"].includes(entity);
}

export const stateCatalog = ["Address", "Contact", "Email", "Message", "Phone", "User"].flatMap((entity) => [
  { entity, name: "Activo", description: `${entity} activo.` },
  { entity, name: "Desactivado", description: `${entity} desactivado.` },
  // Existing phone/message endpoints use this name. Preserve compatibility without rewriting IDs.
  ...(["Phone", "Message", "Email"].includes(entity) ? [{ entity, name: "active", description: `${entity} active.` }] : []),
]);
