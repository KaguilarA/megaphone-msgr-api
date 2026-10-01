import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import routeConfig from "../consts/config.js";
import permissions from "../db/megaphone-msgr-db.permissions.json" with { type: "json" };

const currentFile = fileURLToPath(import.meta.url);
const repositoryRoot = path.dirname(path.dirname(currentFile));

const routeFiles = {
  ActionLog: "routes/actionLog/routes.js",
  Address: "routes/address/routes.js",
  Contact: "routes/contact/routes.js",
  Email: "routes/email/routes.js",
  Message: "routes/message/routes.js",
  Phone: "routes/phone/routes.js",
  State: "routes/state/routes.js",
  Token: "routes/userTokens/routes.js",
  User: "routes/user/routes.js",
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