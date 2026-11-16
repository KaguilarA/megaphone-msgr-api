import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { resolve, join } from 'node:path';
import { homedir } from 'node:os';
import dns from 'node:dns';
import mongoose from 'mongoose';
import { OwlCrypto } from 'owl-expressjs-utils';
import { normalizePhoneNumber } from '../utils/phoneNumber.js';

// Audit by default. Copies live application records, never sessions or installation markers.
const apply = process.argv.includes('--apply');
const root = resolve(import.meta.dirname, '..');
const sourceEnv = parseEnv(await readFile(join(root, '.env'), 'utf8'));
const targetEnv = parseEnv(await readFile(join(root, '.env.production'), 'utf8'));
assert.equal(new URL(sourceEnv.DB_HOST).hostname, 'localhost');
assert.equal(new URL(targetEnv.DB_HOST).pathname, '/megaphone-production');
assert.ok(new URL(targetEnv.DB_HOST).hostname.endsWith('.mongodb.net'));
// Process-local resolver workaround; does not change Windows or application settings.
dns.setServers(['1.1.1.1', '8.8.8.8']);
const { MongoClient, BSON } = mongoose.mongo;
const collections = ['states', 'permissions', 'users', 'emails', 'contacts', 'addresses',
  'phones', 'tokens', 'messages', 'messagereceptors', 'userpermissions', 'actionlogs'];
const clients = [sourceEnv, targetEnv].map(env => new MongoClient(env.DB_HOST, { serverSelectionTimeoutMS: 15000 }));
const key = doc => `${doc.entity}\0${doc.name}`;
const id = value => String(value);
const redact = value => {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== 'object' || value instanceof Date || value._bsontype) return value;
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k,
    /password|token|secret|authorization|cookie/i.test(k) ? '[REDACTED]' : redact(v)]));
};
try {
  await Promise.all(clients.map(client => client.connect()));
  const [sourceDb, targetDb] = clients.map(client => client.db());
  const source = {}, target = {};
  for (const name of collections) {
    source[name] = await sourceDb.collection(name).find({}).toArray();
    target[name] = await targetDb.collection(name).find({}).toArray();
  }
  const mapping = new Map();
  for (const name of ['states', 'permissions']) {
    assert.equal(new Set(source[name].map(key)).size, source[name].length, `Duplicate local ${name}`);
    for (const doc of source[name]) {
      const existing = target[name].find(candidate => key(candidate) === key(doc));
      if (existing) mapping.set(id(doc._id), existing._id);
    }
  }
  for (const user of source.users) {
    const emails = source.emails.filter(email => email.ownerType === 'User' && id(email.owner) === id(user._id));
    const matches = target.emails.filter(email => email.ownerType === 'User' &&
      emails.some(local => local.email.toLowerCase() === email.email.toLowerCase()));
    const owners = new Set(matches.map(email => id(email.owner)));
    assert.ok(owners.size <= 1, 'Local account matches multiple cloud users');
    if (matches.length) {
      assert.ok(target.users.some(candidate => id(candidate._id) === id(matches[0].owner)));
      mapping.set(id(user._id), matches[0].owner);
    }
  }
  for (const email of source.emails.filter(email => email.ownerType === 'User')) {
    const existing = target.emails.find(candidate => candidate.ownerType === 'User' &&
      candidate.email.toLowerCase() === email.email.toLowerCase());
    if (existing) mapping.set(id(email._id), existing._id);
  }
  const remap = value => {
    if (value?._bsontype === 'ObjectId') return mapping.get(id(value)) ?? value;
    if (value instanceof Date || Buffer.isBuffer(value)) return value;
    if (Array.isArray(value)) return value.map(remap);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, remap(v)]));
    return value;
  };
  const planned = {};
  const credentialWarnings = [];
  for (const name of collections) planned[name] = source[name].map(remap);
  for (const phone of planned.phones) Object.assign(phone, normalizePhoneNumber(phone));
  const phoneKeys = planned.phones.map(phone => `${phone.ownerType}:${phone.owner}:${phone.e164}`);
  assert.equal(new Set(phoneKeys).size, phoneKeys.length, 'Duplicate local phone numbers');
  for (const name of ['tokens', 'emails']) {
    const fields = name === 'tokens' ? ['emailToken', 'whatsappToken', 'telegramBotToken'] : ['smtpPassword'];
    for (const doc of planned[name]) for (const field of fields) if (doc[field]) {
      OwlCrypto.setEncryptionAlgorithm(sourceEnv.ENCRYPTION_ALGORITHM || 'aes-256-gcm');
      OwlCrypto.setEncryptionKey(sourceEnv.ENCRYPTION_KEY);
      // Older local records may contain plaintext or a malformed legacy value.
      // Preserve the exact value, encrypted with the cloud key, without guessing a repair.
      const encrypted = OwlCrypto.isEncrypted(doc[field]);
      const clear = encrypted ? OwlCrypto.decrypt(doc[field]) : doc[field];
      if (!encrypted && clear.includes(':')) credentialWarnings.push({ collection: name, field, id: id(doc._id), issue: 'unrecognized_local_credential_format' });
      OwlCrypto.setEncryptionAlgorithm(targetEnv.ENCRYPTION_ALGORITHM || 'aes-256-gcm');
      OwlCrypto.setEncryptionKey(targetEnv.ENCRYPTION_KEY);
      doc[field] = OwlCrypto.encrypt(clear);
      assert.equal(OwlCrypto.decrypt(doc[field]), clear);
    }
  }
  for (const token of planned.tokens) {
    const phone = planned.phones.find(phone => id(phone._id) === id(token.phone));
    assert.ok(phone && phone.ownerType === 'User' && id(phone.owner) === id(token.owner), 'Invalid token ownership');
    phone.tokens ??= {};
    if (token.whatsappToken) phone.tokens.whatsapp = token._id;
    if (token.telegramBotToken) phone.tokens.telegram = token._id;
  }
  for (const log of planned.actionlogs) log.metadata = redact(log.metadata);
  let recoveredStateCount = 0;
  for (const [collection, entity] of Object.entries({ users: 'User', emails: 'Email', contacts: 'Contact',
    addresses: 'Address', phones: 'Phone', messages: 'Message' })) for (const doc of planned[collection]) {
    for (const stateId of (Array.isArray(doc.state) ? doc.state : doc.state ? [doc.state] : [])) {
      if (![...planned.states, ...target.states].some(state => id(state._id) === id(stateId))) {
        // Preserve the original reference without inventing an active/sent state.
        planned.states.push({ _id: stateId, entity, name: `Sin clasificar (importado ${id(stateId)})`,
          description: 'La referencia existía en los datos locales, pero su definición de estado faltaba.',
          createdAt: new Date(), updatedAt: new Date() });
        recoveredStateCount++;
      }
    }
  }
  // Verify all actual foreign keys before any write. Historical message senderPhone may be absent.
  const refs = { users: { state: 'states' }, emails: { owner: doc => doc.ownerType === 'User' ? 'users' : 'contacts', state: 'states' },
    contacts: { owner: 'users', state: 'states' }, phones: { owner: doc => doc.ownerType === 'User' ? 'users' : 'contacts', state: 'states' },
    tokens: { owner: 'users', phone: 'phones' }, messages: { sender: 'users', senderPhone: 'phones', state: 'states' },
    messagereceptors: { message: 'messages', contact: 'contacts' }, userpermissions: { user: 'users', permission: 'permissions' },
    actionlogs: { user: 'users', permission: 'permissions' }, addresses: { owner: doc => doc.ownerType === 'User' ? 'users' : 'contacts', state: 'states' } };
  for (const [name, fields] of Object.entries(refs)) for (const doc of planned[name]) for (const [field, destination] of Object.entries(fields)) {
    const targetName = typeof destination === 'function' ? destination(doc) : destination;
    const values = Array.isArray(doc[field]) ? doc[field] : doc[field] ? [doc[field]] : [];
    for (const value of values) assert.ok([...planned[targetName], ...target[targetName]].some(candidate => id(candidate._id) === id(value)), `Dangling reference: ${name}.${field}`);
  }
  const pending = {};
  for (const name of collections) pending[name] = planned[name].filter(doc => !target[name].some(existing =>
    id(doc._id) === id(existing._id) || (name === 'userpermissions' && id(doc.user) === id(existing.user) && id(doc.permission) === id(existing.permission))));
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'audit', targetDatabase: targetDb.databaseName,
    sourceCounts: Object.fromEntries(collections.map(name => [name, source[name].length])),
    insertCounts: Object.fromEntries(collections.map(name => [name, pending[name].length])),
    mappedAccounts: source.users.filter(user => mapping.has(id(user._id))).length,
    credentialWarnings,
    recoveredStateCount,
    historicalMessagesWithoutSenderPhone: planned.messages.filter(message => !message.senderPhone).length }));
  if (apply) {
    const backupDirectory = join(homedir(), '.codex', 'backups', 'megaphone', new Date().toISOString().replace(/[:.]/g, '-'));
    await mkdir(backupDirectory, { recursive: true });
    await writeFile(join(backupDirectory, 'local-before.ejson'), BSON.EJSON.stringify(source, { relaxed: false }));
    // Include runtime collections in the recovery snapshot, but never import local sessions.
    const backup = { ...target };
    for (const name of ['installations', 'sessions']) backup[name] = await targetDb.collection(name).find({}).toArray();
    await writeFile(join(backupDirectory, 'atlas-before.ejson'), BSON.EJSON.stringify(backup, { relaxed: false }));
    const session = clients[1].startSession();
    try {
      await session.withTransaction(async () => {
        for (const name of collections) for (const doc of pending[name]) {
          const result = await targetDb.collection(name).updateOne({ _id: doc._id }, { $setOnInsert: doc }, { upsert: true, session });
          assert.equal(result.upsertedCount, 1, 'Cloud data changed during import; transaction aborted');
        }
      });
    } finally { await session.endSession(); }
    for (const name of collections) for (const doc of planned[name]) {
      const query = name === 'userpermissions' ? { user: doc.user, permission: doc.permission } : { _id: doc._id };
      assert.ok(await targetDb.collection(name).findOne(query), `Verification failed: ${name}`);
    }
    console.log(JSON.stringify({ completed: true, backupDirectory,
      cloudCounts: Object.fromEntries(await Promise.all(collections.map(async name => [name, await targetDb.collection(name).countDocuments()])))}));
  }
} catch (error) {
  console.error(error.name === 'AssertionError' ? error.message : `Copy failed (${error.name}, code ${error.code ?? 'unknown'}). No credentials logged.`);
  process.exitCode = 1;
} finally { await Promise.all(clients.map(client => client.close())); }
