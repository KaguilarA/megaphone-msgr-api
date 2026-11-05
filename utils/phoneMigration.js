import { normalizePhoneNumber } from "./phoneNumber.js";

/** Pure audit shared by the migration CLI and tests. Never guesses a legacy token's number. */
export function planPhoneMigration(phones, tokens) {
  const updates = [];
  const issues = [];
  const identities = new Map();
  const phoneIds = new Map(phones.map((phone) => [String(phone._id), phone]));
  for (const phone of phones) {
    try {
      if (!["User", "Contact"].includes(phone.ownerType) || !phone.owner) throw new Error("invalid_owner");
      const normalized = normalizePhoneNumber(phone);
      const key = `${phone.ownerType}:${phone.owner}:${normalized.e164}`;
      if (identities.has(key)) issues.push({ type: "duplicate_phone", ids: [identities.get(key), String(phone._id)] });
      else identities.set(key, String(phone._id));
      if (Object.keys(normalized).some((key) => phone[key] !== normalized[key])) updates.push({ id: phone._id, original: phone, data: normalized });
    } catch {
      issues.push({ type: "invalid_phone", ids: [String(phone._id)] });
    }
  }
  const tokenKeys = new Map();
  let legacyTokens = 0;
  for (const token of tokens) {
    if (!token.phone) { legacyTokens++; continue; }
    const phone = phoneIds.get(String(token.phone));
    if (!phone || phone.ownerType !== "User" || String(phone.owner) !== String(token.owner)) {
      issues.push({ type: "invalid_token_owner", ids: [String(token._id)] });
    }
    const key = `${token.owner}:${token.phone}`;
    if (tokenKeys.has(key)) issues.push({ type: "duplicate_token", ids: [tokenKeys.get(key), String(token._id)] });
    else tokenKeys.set(key, String(token._id));
  }
  return { updates, issues, legacyTokens };
}
