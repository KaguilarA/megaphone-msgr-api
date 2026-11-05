import test from 'node:test';
import assert from 'node:assert/strict';
import PhoneController from '../controllers/phone/controller.js';
import TokenController from '../controllers/userTokens/controller.js';
import MessageController from '../controllers/message/controller.js';
import PhoneData from '../models/phone/model.js';
import TokenData from '../models/tokens/model.js';
import MessageData from '../models/message/model.js';
import { normalizePhoneNumber } from '../utils/phoneNumber.js';
import { planPhoneMigration } from '../utils/phoneMigration.js';
import { redactAuditMetadata } from '../middlewares/actionLog/actionLog.js';

const owner = 'user-1';
const req = (body = {}, id = 'phone-1') => ({ session: { userId: owner }, body, params: { id } });
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; }, end() { return this; } });
const phone = { _id: 'phone-1', owner, ownerType: 'User', phone: '88887777', countryNumber: '+506' };

for (const [name, input] of Object.entries({ object: { phone: { $gt: '' }, countryNumber: '+506' }, invalid: { phone: 'abc123', countryNumber: '+506' }, prefix: { phone: '88887777', countryNumber: '+000' }, long: { phone: '1'.repeat(16), countryNumber: '+506' } })) {
  test(`rejects ${name} phone input before persistence`, async () => {
    const controller = PhoneController({ model: { save: async () => assert.fail('must not save') } });
    const res = response();
    await controller.registerForUser(req(input), res);
    assert.equal(res.statusCode, 400);
  });
}

test('normalizes punctuation and preserves significant leading zeroes', () => {
  assert.deepEqual(normalizePhoneNumber({ phone: '(0888) 777-77', countryNumber: '506' }), { phone: '088877777', countryNumber: '+506', e164: '+506088877777' });
});

for (const operation of ['getDataById', 'updateDataById', 'deleteDataById']) {
  for (const ownerType of ['User', 'Contact']) {
    test(`${operation} blocks another account's ${ownerType} phone`, async () => {
      const controller = PhoneController({
        model: { getById: async () => ({ ...phone, owner: 'someone-else', ownerType }), update: async () => assert.fail(), delete: async () => assert.fail() },
        contactModel: { getById: async () => ({ owner: 'someone-else' }) },
      });
      const res = response();
      await controller[operation](req({ phone: '88886666' }), res);
      assert.equal(res.statusCode, 404);
    });
  }
}

test('rejects normalized duplicates including old unnormalized records', async () => {
  const controller = PhoneController({ model: { getByCoincidence: async () => [{ ...phone, phone: '8888-7777' }], save: async () => assert.fail() } });
  const res = response();
  await controller.registerForUser(req({ phone: '(8888) 7777', countryNumber: '506' }), res);
  assert.equal(res.statusCode, 409);
});

test('reports the database unique-index race as conflict', async () => {
  const controller = PhoneController({ model: { getByCoincidence: async () => [], save: async () => { throw Object.assign(new Error('duplicate'), { code: 11000 }); } } });
  const res = response();
  await controller.registerForUser(req(phone), res);
  assert.equal(res.statusCode, 409);
});

test('does not let a payload transfer ownership or attach arbitrary tokens', async () => {
  let saved;
  const controller = PhoneController({ model: { getByCoincidence: async () => [], save: async (data) => (saved = data) } });
  const res = response();
  await controller.registerForUser(req({ ...phone, owner: 'victim', ownerType: 'Contact', tokens: { whatsapp: 'stolen' }, state: ['injected'] }), res);
  assert.equal(res.statusCode, 201);
  assert.equal(saved.owner, owner);
  assert.equal(saved.ownerType, 'User');
  assert.equal(saved.tokens, undefined);
  assert.equal(saved.state, undefined);
});

test('deleting an owned user number removes only its linked credentials', async () => {
  const deleted = [];
  const controller = PhoneController({ model: { getById: async () => phone, delete: async (id) => deleted.push(id) }, tokenModel: {
    getByCoincidence: async (filter) => { assert.deepEqual(filter, { owner, phone: phone._id }); return [{ _id: 'token-1' }]; },
    delete: async (id) => deleted.push(id),
  } });
  const res = response();
  await controller.deleteDataById(req(), res);
  assert.equal(res.statusCode, 204);
  assert.deepEqual(deleted, ['token-1', 'phone-1']);
});

for (const operation of ['getById', 'update', 'delete']) {
  test(`token ${operation} blocks cross-account access`, async () => {
    const controller = TokenController({ model: { getById: async () => ({ owner: 'victim' }) } });
    const res = response();
    await controller[operation](req(), res);
    assert.equal(res.statusCode, 404);
  });
}

test('token metadata responses never disclose either channel secret', async () => {
  const controller = TokenController({ model: { getById: async () => ({ _id: 't-1', owner, phone: phone._id, whatsappToken: 'secret', whatsappVersion: 'v22.0', whatsappPhoneNumberId: '123', telegramBotToken: 'secret2' }) } });
  const res = response();
  await controller.getById(req(), res);
  assert.equal(res.body.hasWhatsappToken, true);
  assert.equal(res.body.hasTelegramToken, true);
  assert.equal(JSON.stringify(res.body).includes('secret'), false);
});

test('migration detects duplicates before any writes and keeps owner types distinct', () => {
  const plan = planPhoneMigration([phone, { ...phone, _id: 'p-2', phone: '8888-7777' }, { ...phone, _id: 'p-3', ownerType: 'Contact' }], [{ _id: 't-1' }]);
  assert.deepEqual(plan.issues, [{ type: 'duplicate_phone', ids: ['phone-1', 'p-2'] }]);
  assert.equal(plan.legacyTokens, 1);
});

test('migration rejects duplicate and incorrectly owned phone tokens', () => {
  const plan = planPhoneMigration([phone], [{ _id: 't-1', owner, phone: phone._id }, { _id: 't-2', owner, phone: phone._id }, { _id: 't-3', owner: 'victim', phone: phone._id }]);
  assert.deepEqual(plan.issues.map((issue) => issue.type), ['duplicate_token', 'invalid_token_owner']);
});

test('migration can run repeatedly without further changes', () => {
  assert.equal(planPhoneMigration([{ ...phone, e164: '+50688887777' }], []).updates.length, 0);
});

test('phone, token and message schemas declare database-enforced uniqueness', () => {
  for (const data of [PhoneData, TokenData, MessageData]) assert.ok(data.schema.indexes().some(([, options]) => options.unique && options.partialFilterExpression));
});

test('audit redacts nested credentials without changing request data', () => {
  const metadata = { body: { whatsappToken: 'secret', smtpPassword: 'password', child: [{ telegramBotToken: 'telegram' }], phone: 'phone-1' } };
  const redacted = redactAuditMetadata(metadata);
  assert.equal(redacted.body.whatsappToken, '[REDACTED]');
  assert.equal(redacted.body.smtpPassword, '[REDACTED]');
  assert.equal(redacted.body.child[0].telegramBotToken, '[REDACTED]');
  assert.equal(redacted.body.phone, 'phone-1');
  assert.equal(metadata.body.whatsappToken, 'secret');
});

function messageFixture({ invalidContact, legacyToken, failSend, failSave, previous } = {}) {
  const sent = [], saves = [], updates = [];
  const controller = MessageController({
    model: {
      getOne: async () => previous,
      save: async (data) => { if (failSave) throw new Error('database unavailable'); saves.push(data); return { _id: 'message-1', toJSON: () => data }; },
      update: async (_id, data) => updates.push(structuredClone(data)),
    },
    receptorModel: { save: async (data) => data },
    phoneModel: { getById: async () => phone, getByCoincidence: async ({ owner }) => [{ phone: owner === 'contact-1' ? '88880001' : '88880002', countryNumber: '+506' }] },
    tokenModel: { getOne: async () => ({ owner, phone: legacyToken ? undefined : phone._id, whatsappToken: 'secret', whatsappVersion: 'v22.0', whatsappPhoneNumberId: '123' }), getByCoincidence: async () => [{ owner, whatsappToken: 'legacy' }] },
    contactModel: { getById: async (id) => ({ owner: invalidContact === id ? 'victim' : owner }) },
    sendWhatsAppMessage: async (recipient) => { sent.push(recipient); if (failSend && sent.length === 2) throw new Error('timeout'); return { messages: [{ id: 'provider-1' }] }; },
  });
  return { controller, sent, saves, updates };
}
const messageReq = (extra = {}) => req({ requestId: 'd06b1e8b-93df-44c0-b3f8-8b3a40d7aad5', header: 'Aviso', content: 'Hola', sourcePhoneId: phone._id, contacts: ['contact-1', 'contact-2'], ...extra });

test('validates every recipient before sending anything', async () => {
  const { controller, sent, saves } = messageFixture({ invalidContact: 'contact-2' });
  const res = response();
  await controller.register(messageReq(), res);
  assert.equal(res.statusCode, 403);
  assert.equal(sent.length, 0);
  assert.equal(saves.length, 0);
});

test('never falls back to an unbound legacy WhatsApp credential', async () => {
  const { controller, sent } = messageFixture({ legacyToken: true });
  const res = response();
  await controller.register(messageReq(), res);
  assert.equal(res.statusCode, 422);
  assert.equal(sent.length, 0);
});

test('does not send if the initial durable message write fails', async () => {
  const { controller, sent } = messageFixture({ failSave: true });
  const res = response();
  await controller.register(messageReq(), res);
  assert.equal(res.statusCode, 500);
  assert.equal(sent.length, 0);
});

test('records partial acceptance and uncertain delivery without retrying', async () => {
  const { controller, sent, updates } = messageFixture({ failSend: true });
  const res = response();
  await controller.register(messageReq(), res);
  assert.equal(res.statusCode, 201);
  assert.equal(sent.length, 2);
  assert.equal(res.body.deliveryStatus, 'partial');
  assert.deepEqual(res.body.deliveries.map((delivery) => delivery.status), ['accepted', 'unknown']);
  assert.equal(updates.at(-1).deliveryStatus, 'partial');
});

test('replaying a recorded request never sends a second time', async () => {
  const previous = { _id: 'message-1', deliveryStatus: 'sending' };
  const { controller, sent, saves } = messageFixture({ previous });
  const res = response();
  await controller.register(messageReq({ requestId: 'd06b1e8b-93df-44c0-b3f8-8b3a40d7aad5' }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body, previous);
  assert.equal(sent.length, 0);
  assert.equal(saves.length, 0);
});

test('invalid multipart contacts return 400', async () => {
  const { controller } = messageFixture();
  const res = response();
  await controller.register(messageReq({ contacts: '{invalid' }), res);
  assert.equal(res.statusCode, 400);
});

test('rejects malformed UUIDs and missing idempotency keys before sending', async () => {
  for (const requestId of [undefined, '-'.repeat(36)]) {
    const { controller, sent } = messageFixture();
    const res = response();
    await controller.register(messageReq({ requestId }), res);
    assert.equal(res.statusCode, 400);
    assert.equal(sent.length, 0);
  }
});

test('does not disclose or delete messages belonging to another user', async () => {
  for (const operation of ['getById', 'delete']) {
    const controller = MessageController({ model: { getById: async () => ({ sender: 'victim' }), delete: async () => assert.fail() }, receptorModel: { getByCoincidence: async () => assert.fail() } });
    const res = response();
    await controller[operation](req(), res);
    assert.equal(res.statusCode, 404);
  }
});
