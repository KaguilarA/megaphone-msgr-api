import mongoose from "mongoose";
import { DbHost } from "../consts/index.js";
import { planPhoneMigration } from "../utils/phoneMigration.js";

// Default is an audit. Run --apply only with API writers stopped and a database backup.
const apply = process.argv.includes("--apply");
try {
  // Match OwlMongoConnect: application data uses the database in DB_HOST.
  await mongoose.connect(DbHost, { autoIndex: false, serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  const phones = db.collection("phones");
  const tokens = db.collection("tokens");
  const plan = planPhoneMigration(await phones.find({}).toArray(), await tokens.find({}, {
    projection: { _id: 1, owner: 1, phone: 1 },
  }).toArray());
  console.log(JSON.stringify({ mode: apply ? "apply" : "audit", updates: plan.updates.length,
    legacyTokens: plan.legacyTokens, issues: plan.issues }, null, 2));
  if (plan.issues.length) throw new Error("Resolve the reported record IDs before applying the migration.");
  if (apply) {
    for (const { id, original, data } of plan.updates) {
      const result = await phones.updateOne({ _id: id, phone: original.phone, countryNumber: original.countryNumber,
        owner: original.owner, ownerType: original.ownerType }, { $set: data });
      if (result.matchedCount !== 1) throw new Error("A phone changed during migration. Stop writers and audit again.");
    }
    await phones.createIndex({ ownerType: 1, owner: 1, e164: 1 }, {
      unique: true, partialFilterExpression: { e164: { $type: "string" } }, name: "unique_owner_phone",
    });
    await tokens.createIndex({ owner: 1, phone: 1 }, {
      unique: true, partialFilterExpression: { phone: { $type: "objectId" } }, name: "unique_owner_phone_token",
    });
    await db.collection("messages").createIndex({ sender: 1, requestId: 1 }, {
      unique: true, partialFilterExpression: { requestId: { $type: "string" } }, name: "unique_sender_request",
    });
    console.log("Phone normalization and unique indexes completed.");
  }
} catch (error) {
  // Do not print connection strings, credentials, or provider secrets.
  console.error("Migration failed:", error.name);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
