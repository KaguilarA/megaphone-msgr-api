import mongoose from "mongoose";
import "../models/models.js";
import { permissionCatalog, stateCatalog } from "./catalog.js";
import { createAccountInSession } from "./accounts.js";

export const INSTALLATION_ID = "initial-setup";

/** Run only from the server CLI. No public HTTP route can create an administrator. */
export async function bootstrapInstallation(credentials, { connection = mongoose.connection } = {}) {
  const { Installation, Permission, State, User } = connection.models;
  return connection.transaction(async (session) => {
    // The singleton serializes concurrent installers through MongoDB transaction conflicts.
    const installation = await Installation.findOneAndUpdate({ _id: INSTALLATION_ID },
      { $setOnInsert: { version: 1 } }, { upsert: true, new: true, session });
    if (!installation.completedAt && await User.exists({}).session(session)) {
      throw Object.assign(new Error("Esta base ya contiene usuarios sin un registro de instalación. No se creará ni promoverá un administrador automáticamente."), { code: "EXISTING_INSTALLATION" });
    }
    for (const permission of permissionCatalog) {
      await Permission.updateOne({ entity: permission.entity, name: permission.name }, { $setOnInsert: permission }, { upsert: true, session });
    }
    for (const state of stateCatalog) {
      await State.updateOne({ entity: state.entity, name: state.name }, { $setOnInsert: state }, { upsert: true, session });
    }
    if (installation.completedAt) {
      return { created: false, administratorId: installation.administrator };
    }
    const administrator = await createAccountInSession(credentials, session, { administrator: true, connection });
    installation.administrator = administrator._id;
    installation.completedAt = new Date();
    await installation.save({ session });
    return { created: true, administratorId: administrator._id };
  });
}
