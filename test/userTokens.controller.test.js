import test from 'node:test';
import assert from 'node:assert/strict';
import UserTokenController from '../controllers/userTokens/controller.js';

const owner = 'user-1';
const phoneId = 'phone-1';

function createRes() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function createDependencies() {
  const phone = {
    _id: phoneId,
    owner,
    ownerType: 'User',
    phone: '4155552670',
    countryNumber: '+1',
    tokens: {},
  };
  const updates = [];
  const token = { _id: 'token-1', owner, phone: phoneId };
  const model = {
    getOne: async () => null,
    save: async (data) => ({ ...token, ...data }),
  };
  const phoneModel = {
    getById: async () => phone,
    update: async (_id, data) => { updates.push(data); return data; },
  };
  return { controller: UserTokenController({ model, phoneModel }), updates, model };
}

test('saving a WhatsApp connection links its Token record to Phone without returning session details', async () => {
  const { controller, updates } = createDependencies();
  const res = createRes();

  await controller.saveWhatsApp({
    session: { userId: owner },
    body: { phone: phoneId, whatsappSession: 'my-number' },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(updates[0], { 'tokens.whatsapp': 'token-1' });
  assert.equal(res.body.hasWhatsAppConnection, true);
  assert.equal(Object.hasOwn(res.body, 'whatsappSession'), false);
  assert.equal(Object.hasOwn(res.body, 'whatsappToken'), false);
});

test('a WhatsApp session cannot be assigned to a second phone', async () => {
  const res = createRes();
  const guardedController = UserTokenController({
    model: {
      getOne: async (filter) => filter.whatsappSession
        ? { _id: 'existing-token', phone: 'other-phone' }
        : null,
      save: async () => assert.fail('Conflicting session must not be saved'),
    },
    phoneModel: {
      getById: async () => ({ _id: phoneId, owner, ownerType: 'User' }),
      update: async () => assert.fail('Conflicting session must not be linked'),
    },
  });

  await guardedController.saveWhatsApp({
    session: { userId: owner },
    body: { phone: phoneId, whatsappSession: 'other-session' },
  }, res);

  assert.equal(res.statusCode, 409);
});

test('saving a Telegram token links it under Phone.tokens.telegram', async () => {
  const { controller, updates } = createDependencies();
  const res = createRes();

  await controller.saveTelegram({
    session: { userId: owner },
    params: { phoneId },
    body: { telegramBotToken: 'telegram-secret' },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(updates[0], { 'tokens.telegram': 'token-1' });
  assert.equal(res.body.hasTelegramToken, true);
  assert.equal(Object.hasOwn(res.body, 'telegramBotToken'), false);
});

test('token registration rejects phones owned by another user', async () => {
  const controller = UserTokenController({
    model: { getOne: async () => null, save: async () => assert.fail('Token must not be saved') },
    phoneModel: { getById: async () => ({ _id: phoneId, owner: 'another-user', ownerType: 'User' }) },
  });
  const res = createRes();

  await controller.saveTelegram({
    session: { userId: owner },
    params: { phoneId },
    body: { telegramBotToken: 'telegram-secret' },
  }, res);

  assert.equal(res.statusCode, 403);
});

test('a user cannot create a WhatsApp connection for another account phone', async () => {
  const { model } = createDependencies();
  let providerCalled = false;
  const controller = UserTokenController({
    model,
    phoneModel: {
      getById: async () => ({
        _id: phoneId,
        owner: 'another-user',
        ownerType: 'User',
        phone: '4155552670',
        countryNumber: '+1',
      }),
    },
    whatsappConfig: { apiBaseUrl: 'http://waha.example.test:3000', apiKey: 'secret-key' },
    whatsappFetch: async () => {
      providerCalled = true;
      assert.fail('No connection request should be sent for another account phone');
    },
  });
  const res = createRes();

  await controller.startWhatsAppConnection({
    session: { userId: owner },
    params: { phoneId },
  }, res);

  assert.equal(res.statusCode, 403);
  assert.equal(providerCalled, false);
});

test('reports the upstream status without exposing service credentials', async () => {
  const { model } = createDependencies();
  const controller = UserTokenController({
    model,
    phoneModel: {
      getById: async () => ({
        _id: phoneId,
        owner,
        ownerType: 'User',
        phone: '4155552670',
        countryNumber: '+1',
      }),
    },
    whatsappConfig: { apiBaseUrl: 'http://waha.example.test:3000', apiKey: 'secret-key' },
    whatsappFetch: async () => ({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    }),
  });
  const res = createRes();

  await controller.startWhatsAppConnection({
    session: { userId: owner },
    params: { phoneId },
  }, res);

  assert.equal(res.statusCode, 502);
  assert.match(res.body.message, /código del servicio: 401/i);
  assert.doesNotMatch(res.body.message, /secret-key/);
});

test('reports and safely logs upstream server errors', async () => {
  const { model } = createDependencies();
  const controller = UserTokenController({
    model,
    phoneModel: {
      getById: async () => ({
        _id: phoneId,
        owner,
        ownerType: 'User',
        phone: '4155552670',
        countryNumber: '+1',
      }),
    },
    whatsappConfig: { apiBaseUrl: 'http://waha.example.test:3000', apiKey: 'secret-key' },
    whatsappFetch: async () => ({
      ok: false,
      status: 503,
      json: async () => ({ message: 'Unavailable' }),
    }),
  });
  const res = createRes();
  const logged = [];
  const originalError = console.error;
  console.error = (...args) => logged.push(args);

  try {
    await controller.getWhatsAppConnection({
      session: { userId: owner },
      params: { phoneId },
    }, res);
  } finally {
    console.error = originalError;
  }

  assert.equal(res.statusCode, 503);
  assert.match(res.body.message, /código del servicio: 503/i);
  assert.deepEqual(logged, [[
    'WhatsApp connection service returned an error:',
    { operation: 'session lookup', status: 503 },
  ]]);
  assert.doesNotMatch(JSON.stringify(logged), /secret-key|Unavailable/);
});

test('starts a new connection and returns the QR without exposing its internal session name', async () => {
  const requests = [];
  let created = false;
  const { model, updates } = createDependencies();
  const controller = UserTokenController({
    model,
    phoneModel: {
      getById: async () => ({
        _id: phoneId,
        owner,
        ownerType: 'User',
        phone: '4155552670',
        countryNumber: '+1',
      }),
      update: async (_id, data) => { updates.push(data); return data; },
    },
    whatsappConfig: { apiBaseUrl: 'http://waha.example.test:3000', apiKey: 'secret-key' },
    whatsappFetch: async (url, request) => {
      requests.push({ url, request });
      if (url.endsWith('/api/sessions/m-phone-1')) {
        return created
          ? { ok: true, status: 200, json: async () => ({ status: 'SCAN_QR_CODE' }) }
          : { ok: false, status: 404, json: async () => ({ message: 'Not found' }) };
      }
      if (url.endsWith('/api/sessions') && request.method === 'POST') {
        created = true;
        return { ok: true, status: 201, json: async () => ({ status: 'STARTING' }) };
      }
      if (url.endsWith('/api/m-phone-1/auth/qr?format=image')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ mimetype: 'image/png', data: 'qr-image-data' }),
        };
      }
      assert.fail(`Unexpected request: ${url}`);
    },
  });
  const res = createRes();

  await controller.startWhatsAppConnection({
    session: { userId: owner },
    params: { phoneId },
  }, res);

  assert.equal(res.body.status, 'qr_ready');
  assert.equal(res.body.qrCode, 'qr-image-data');
  assert.equal(Object.hasOwn(res.body, 'whatsappSession'), false);
  assert.equal(Object.hasOwn(res.body, 'apiKey'), false);
  assert.equal(requests[0].request.headers['X-Api-Key'], 'secret-key');
  assert.equal(updates.length, 0);
});

test('stores the connection only after the selected phone is authenticated', async () => {
  const { model, updates } = createDependencies();
  model.save = async (data) => ({ _id: 'token-1', ...data });
  const controller = UserTokenController({
    model,
    phoneModel: {
      getById: async () => ({
        _id: phoneId,
        owner,
        ownerType: 'User',
        phone: '4155552670',
        countryNumber: '+1',
      }),
      update: async (_id, data) => { updates.push(data); return data; },
    },
    whatsappConfig: { apiBaseUrl: 'http://waha.example.test:3000', apiKey: 'secret-key' },
    whatsappFetch: async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        status: 'WORKING',
        me: { id: '14155552670@c.us' },
      }),
    }),
  });
  const res = createRes();

  await controller.getWhatsAppConnection({
    session: { userId: owner },
    params: { phoneId },
  }, res);

  assert.deepEqual(res.body, { status: 'connected' });
  assert.equal(updates[0]['tokens.whatsapp'], 'token-1');
});
