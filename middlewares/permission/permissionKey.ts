/**
 * Normalize route/config entity labels to permission entity names.
 * @param {string|undefined} entity - Entity label from a route configuration.
 * @returns {string|undefined} Normalized permission entity.
 */
export function normalizePermissionEntity(entity) {
  if (!entity) return undefined;

  const compactEntity = String(entity).replace(/[\s_-]/g, "").toLowerCase();
  const knownEntities = {
    actionlog: "ActionLog",
    address: "Address",
    contact: "Contact",
    email: "Email",
    message: "Message",
    phone: "Phone",
    phonenumber: "Phone",
    state: "State",
    token: "Token",
    tokens: "Token",
    user: "User",
  };

  return knownEntities[compactEntity] || String(entity);
}

/**
 * Convert a route permission action into the persisted permission shape.
 * The action name is always supplied separately from its entity.
 * @param {string|{entity?: string, name: string}} reference - Permission action.
 * @param {string} [defaultEntity] - Entity used for a bare permission name.
 * @returns {{entity?: string, name: string}} Parsed permission reference.
 */
export function parsePermissionReference(reference, defaultEntity) {
  if (reference && typeof reference === "object") {
    return {
      entity: normalizePermissionEntity(reference.entity || defaultEntity),
      name: reference.name,
    };
  }

  return {
    entity: normalizePermissionEntity(defaultEntity),
    name: String(reference || ""),
  };
}

