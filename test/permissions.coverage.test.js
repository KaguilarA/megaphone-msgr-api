import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import routeConfig from "../consts/config.js";
import { permissionCatalog as permissions } from "../setup/catalog.js";

const currentFile = fileURLToPath(import.meta.url);
const repositoryRoot = path.dirname(path.dirname(currentFile));

const routeFiles = {
  ActionLog: "routes/actionLog/routes.ts",
  Address: "routes/address/routes.ts",
  Contact: "routes/contact/routes.ts",
  Email: "routes/email/routes.ts",
  Message: "routes/message/routes.ts",
  Phone: "routes/phone/routes.ts",
  State: "routes/state/routes.ts",
  Token: "routes/userTokens/routes.ts",
  User: "routes/user/routes.ts",
};

test("every seeded permission is configured and route-validated", () => {
  const configsByEntity = new Map();
  for (const entry of routeConfig) {
    const entity =
      entry.config.id.replace(/\s+/g, "") === "PhoneNumber"
        ? "Phone"
        : entry.config.id.replace(/\s+/g, "");
    const entries = configsByEntity.get(entity) || [];
    entries.push(entry);
    configsByEntity.set(entity, entries);
  }

  for (const permission of permissions) {
    const entries = configsByEntity.get(permission.entity);
    assert.ok(entries, `Missing route config for ${permission.entity}`);
    assert.ok(
      entries.some((entry) =>
        Object.values(entry.config.actions || {}).includes(permission.name),
      ),
      `Missing configured action ${permission.entity}.${permission.name}`,
    );

    const routeFile = routeFiles[permission.entity];
    assert.ok(routeFile, `Missing route file mapping for ${permission.entity}`);
    const source = fs.readFileSync(path.join(repositoryRoot, routeFile), "utf8");
    assert.match(
      source,
      /routePermission|requirePermission/,
      `Route does not validate ${permission.entity}.${permission.name}`,
    );
  }
});
