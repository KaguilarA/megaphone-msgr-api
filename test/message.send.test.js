import test from 'node:test';
import assert from 'node:assert/strict';
import MessageController from '../controllers/message/controller.js';
import messagePayload from './mocks/message.json' with { type: 'json' };
import user from './mocks/user.json' with { type: 'json' };

function createRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('register creates a message and receptor entries', async () => {
  const savedMessages = [];

  const controller = MessageController({
    entityId: 'Message',
    model: {
      save: async (data) => {
        savedMessages.push(data);
        return { ...data, _id: '665f1a2b3c4d5e6f70819502', toJSON: () => ({ ...data, _id: '665f1a2b3c4d5e6f70819502' }) };
      },
    },
    receptorModel: {
      save: async (data) => ({ _id: '665f1a2b3c4d5e6f70819512', ...data }),
    },
  });

  const req = {
    body: {
      ...messagePayload,
    },
    session: {
      userId: user._id,
    },
  };
  const res = createRes();

  await controller.register(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(savedMessages.length, 1);
  assert.equal(savedMessages[0].content, messagePayload.content);
  assert.equal(savedMessages[0].sender, user._id);
  assert.equal(res.body.content, messagePayload.content);
  assert.equal(res.body.sender, user._id);
});

test('getAll returns only the authenticated user messages', async () => {
  const controller = MessageController({
    entityId: 'Message',
    model: {
      getByCoincidence: async (filter) => [{ _id: '665f1a2b3c4d5e6f70819503', content: messagePayload.content, sender: filter.sender }],
    },
    receptorModel: {
      getByCoincidence: async () => [],
    },
    populatedFields: ['sender'],
  });

  const req = {
    session: { userId: user._id },
  };
  const res = createRes();

  await controller.getAll(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, [{ _id: '665f1a2b3c4d5e6f70819503', content: messagePayload.content, sender: user._id }]);
});

test('register sends through the selected phone token and stores its reference', async () => {
  let savedMessage;
  const sent = [];
  const verified = [];
  const sourcePhoneId = '665f1a2b3c4d5e6f70819601';
  const contactId = '665f1a2b3c4d5e6f708192c1';
  const controller = MessageController({
    model: {
      save: async (data) => {
        savedMessage = data;
        return { ...data, _id: '665f1a2b3c4d5e6f70819502', toJSON: () => ({ ...data, _id: '665f1a2b3c4d5e6f70819502' }) };
      },
      getOne: async () => null,
      update: async (_id, data) => data,
    },
    receptorModel: {
      save: async (data) => data,
    },
    phoneModel: {
      getById: async () => ({ _id: sourcePhoneId, owner: user._id, ownerType: 'User', phone: '5550002', countryNumber: '+52' }),
      getByCoincidence: async () => [{ phone: '5550001', countryNumber: '+52' }],
    },
    tokenModel: {
      getOne: async (query) => ({ owner: user._id, whatsappSession: 'phone-session', phone: query.phone }),
    },
    whatsappConfig: { apiBaseUrl: 'http://waha.example.test:3000', apiKey: 'server-key' },
    verifyWhatsAppSession: async (...args) => verified.push(args),
    contactModel: {
      getById: async () => ({ _id: contactId, owner: user._id }),
    },
    sendWhatsAppMessage: async (...args) => sent.push(args),
  });
  const res = createRes();

  await controller.register({
    body: { header: 'Aviso', content: 'Hola', contacts: [contactId], sourcePhoneId, requestId: 'd06b1e8b-93df-44c0-b3f8-8b3a40d7aad5' },
    session: { userId: user._id },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(savedMessage.senderPhone, sourcePhoneId);
  assert.equal(verified.length, 1);
  assert.equal(verified[0][1], '+525550002');
  assert.equal(sent.length, 1);
  assert.equal(sent[0][0], '+525550001');
  assert.equal(sent[0][2].phone, sourcePhoneId);
  assert.equal(sent[0][3].sessionVerified, true);
});

test('register distributes recipients round-robin across verified sender phones', async () => {
  const firstPhone = {
    _id: '665f1a2b3c4d5e6f70819601',
    owner: user._id,
    ownerType: 'User',
    phone: '5550001',
    countryNumber: '+52',
  };
  const secondPhone = {
    _id: '665f1a2b3c4d5e6f70819602',
    owner: user._id,
    ownerType: 'User',
    phone: '5550002',
    countryNumber: '+52',
  };
  const phonesById = new Map([
    [firstPhone._id, firstPhone],
    [secondPhone._id, secondPhone],
  ]);
  const contacts = ['contact-1', 'contact-2', 'contact-3', 'contact-4'];
  const verified = [];
  const sent = [];
  let savedMessage;
  const controller = MessageController({
    model: {
      save: async (data) => {
        savedMessage = data;
        return { ...data, _id: 'message-1', toJSON: () => ({ ...data, _id: 'message-1' }) };
      },
      getOne: async () => null,
      update: async () => null,
    },
    receptorModel: { save: async (data) => data },
    phoneModel: {
      getById: async (id) => phonesById.get(id),
      getByCoincidence: async ({ owner }) => [{
        phone: `555100${owner.split('-')[1]}`,
        countryNumber: '+52',
      }],
    },
    tokenModel: {
      getOne: async (query) => ({
        owner: user._id,
        phone: query.phone,
        whatsappSession: query.phone === firstPhone._id ? 'session-one' : 'session-two',
      }),
    },
    contactModel: {
      getById: async (id) => ({ _id: id, owner: user._id }),
    },
    whatsappConfig: { apiBaseUrl: 'http://waha.example.test:3000', apiKey: 'server-key' },
    verifyWhatsAppSession: async (...args) => verified.push(args),
    sendWhatsAppMessage: async (...args) => {
      sent.push(args);
      return { messages: [{ id: `provider-${sent.length}` }] };
    },
  });
  const res = createRes();

  await controller.register({
    body: {
      header: 'Aviso',
      content: 'Hola',
      contacts,
      sourcePhoneIds: JSON.stringify([firstPhone._id, secondPhone._id]),
      senderMode: 'round-robin',
      requestId: 'd06b1e8b-93df-44c0-b3f8-8b3a40d7aad5',
    },
    session: { userId: user._id },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(savedMessage.senderMode, 'round-robin');
  assert.deepEqual(
    savedMessage.deliveries.map((delivery) => delivery.senderPhone),
    [firstPhone._id, secondPhone._id, firstPhone._id, secondPhone._id],
  );
  assert.deepEqual(verified.map((args) => args[0].whatsappSession), ['session-one', 'session-two']);
  assert.deepEqual(
    sent.map((args) => args[2].whatsappSession),
    ['session-one', 'session-two', 'session-one', 'session-two'],
  );
});
