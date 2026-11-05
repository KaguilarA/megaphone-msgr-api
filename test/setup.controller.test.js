import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import SetupController from '../controllers/setup/controller.js';
import SetupRouter from '../routes/setup/routes.js';
import UserRouter from '../routes/user/routes.js';

const owner = 'user-1';
const res = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
function dependencies() {
  const filters = [];
  const collection = (data) => ({ getByCoincidence: async (filter) => { filters.push(filter); return data; } });
  return { filters, isDatabaseReady: () => true,
    userModel: { getById: async () => ({ _id: owner, name: 'First', lastName: 'User' }), update: async (_id, data) => data },
    emailModel: collection([{ email: 'first@example.com', smtpPassword: 'smtp-secret' }]),
    phoneModel: collection([{ _id: 'phone-1' }]),
    tokenModel: collection([{ phone: 'phone-1', whatsappToken: 'wa-secret', whatsappVersion: 'v22.0', whatsappPhoneNumberId: '123' }, { whatsappToken: 'legacy-secret' }]),
    contactModel: collection([]), messageModel: collection([]), installationModel: { getById: async () => ({ completedAt: new Date() }) },
    serverFeatures: { mediaUploadsConfigured: false, webhookConfigured: false },
  };
}

test('setup reports owned configuration without returning provider secrets', async () => {
  const data = dependencies(); const response = res();
  await SetupController(data).status({ session: { userId: owner } }, response);
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.checks.whatsappConfiguredCount, 1);
  assert.equal(response.body.checks.smtpConfigured, false);
  assert.equal(response.body.onboardingCompletedAt, null);
  assert.equal(response.body.checks.contactCount, 0);
  assert.equal(JSON.stringify(response.body).includes('secret'), false);
  assert.ok(data.filters.every((filter) => filter.owner === owner || filter.sender === owner));
});

test('a database outage reports unavailable rather than an empty configuration', async () => {
  const response = res();
  await SetupController({ isDatabaseReady: () => false }).status({ session: { userId: owner } }, response);
  assert.equal(response.statusCode, 503);
});

test('finishing onboarding is optional, persistent and always scoped to the session user', async () => {
  const data = dependencies(); let update;
  data.userModel.update = async (id, payload) => { update = { id, payload }; };
  const response = res();
  await SetupController(data).complete({ session: { userId: owner }, body: { userId: 'victim' } }, response);
  assert.equal(update.id, owner);
  assert.ok(update.payload.onboardingCompletedAt instanceof Date);
  assert.equal(response.statusCode, 200);
});

async function httpServer(router, session, run) {
  const app = express(); app.use(express.json()); app.use((req, _res, next) => { req.session = session; next(); }); app.use(router);
  const server = app.listen(0); await new Promise((resolve) => server.once('listening', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); } finally { server.close(); }
}

test('setup HTTP routes require authentication and never expose an admin-creation endpoint', async () => {
  const data = { ...dependencies(), id: 'User', actions: { getStatus: 'getInfo', complete: 'getInfo' } };
  await httpServer(SetupRouter(data), {}, async (base) => {
    assert.equal((await fetch(base + '/status')).status, 401);
    assert.equal((await fetch(base + '/complete', { method: 'POST' })).status, 401);
  });
  await httpServer(SetupRouter(data), { userId: owner }, async (base) => {
    assert.equal((await fetch(base + '/bootstrap', { method: 'POST' })).status, 404);
    assert.equal((await fetch(base + '/status')).status, 403);
  });
});

test('an operational register permission cannot authorize creation of other users', async () => {
  let lookedUp;
  const router = UserRouter({ id: 'User', actions: { post: 'register' },
    permissionModel: { getOne: async (filter) => { lookedUp = filter; return { _id: 'user-register' }; } },
    userPermissionModel: { getOne: async () => null }, createUser: async () => assert.fail(),
  });
  await httpServer(router, { userId: owner }, async (base) => {
    assert.equal((await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
    assert.deepEqual(lookedUp, { entity: 'User', name: 'register' });
  });
});
