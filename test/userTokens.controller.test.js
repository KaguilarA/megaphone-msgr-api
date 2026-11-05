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
  const phone = { _id: phoneId, owner, ownerType: 'User', tokens: {} };
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
  return { controller: UserTokenController({ model, phoneModel }), updates };
}

test('saving a WhatsApp token links its Token record to Phone without returning the secret', async () => {
  const { controller, updates } = createDependencies();
  const res = createRes();

  await controller.saveWhatsApp({
    session: { userId: owner },
    body: { phone: phoneId, whatsappToken: 'wa-secret', whatsappVersion: 'v22.0', whatsappPhoneNumberId: '123456789' },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(updates[0], { 'tokens.whatsapp': 'token-1' });
  assert.equal(res.body.hasWhatsappToken, true);
  assert.equal(Object.hasOwn(res.body, 'whatsappToken'), false);
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
