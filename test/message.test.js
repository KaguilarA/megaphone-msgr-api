import test from 'node:test';
import assert from 'node:assert/strict';
import MessageController from '../controllers/message/controller.js';

test('delete hides a message from Megaphone without deleting it', async () => {
  const updated = [];

  const controller = MessageController({
    id: 'Message',
    model: {
      getById: async () => ({ sender: 'user-1' }),
      update: async (messageId, data) => {
        updated.push({ messageId, data });
        return { _id: messageId, ...data };
      },
    },
  });

  const req = { session: { userId: 'user-1' }, params: { id: '665f1a2b3c4d5e6f70819504' } };
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  await controller.delete(req, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.ended, true);
  assert.equal(updated[0].messageId, '665f1a2b3c4d5e6f70819504');
  assert.ok(updated[0].data.hiddenAt instanceof Date);
});

test('getById returns the message and its receptors', async () => {
  const controller = MessageController({
    id: 'Message',
    model: {
      getById: async () => ({
        sender: 'user-1',
        toJSON: () => ({ _id: '665f1a2b3c4d5e6f70819505', content: 'Confirmacion recibida' }),
      }),
    },
    receptorModel: {
      getByCoincidence: async () => [{ _id: '665f1a2b3c4d5e6f70819515', contact: '665f1a2b3c4d5e6f708192c1' }],
    },
    populatedFields: ['sender'],
  });

  const req = { session: { userId: 'user-1' }, params: { id: '665f1a2b3c4d5e6f70819505' } };
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  await controller.getById(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    _id: '665f1a2b3c4d5e6f70819505',
    content: 'Confirmacion recibida',
    receptors: [{ _id: '665f1a2b3c4d5e6f70819515', contact: '665f1a2b3c4d5e6f708192c1' }],
  });
});

test('getWhatsAppChats returns WAHA chat history independently of Megaphone hiding', async () => {
  let historyRequest;
  const phone = {
    _id: 'phone-1',
    phone: '4155552670',
    countryNumber: '+1',
    owner: 'user-1',
    ownerType: 'User',
    tokens: { whatsapp: 'token-1' },
  };
  const controller = MessageController({
    model: {
      getHiddenProviderMessageIds: async () => ['hidden-provider-message'],
    },
    phoneModel: { getById: async () => phone },
    tokenModel: {
      getById: async () => ({
        _id: 'token-1',
        owner: 'user-1',
        phone: 'phone-1',
        whatsappSession: 'phone-session',
      }),
    },
    whatsappConfig: { apiBaseUrl: 'https://waha.example.test', apiKey: 'secret' },
    getWhatsAppChats: async (token, sourcePhoneNumber, options) => {
      historyRequest = { token, sourcePhoneNumber, options };
      return [{
        id: '14155552671@c.us',
        name: 'Contacto',
        lastMessage: { id: 'hidden-provider-message', body: 'oculto' },
      }];
    },
  });
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  await controller.getWhatsAppChats({
    session: { userId: 'user-1' },
    query: { sourcePhoneId: 'phone-1', limit: '10' },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(historyRequest.sourcePhoneNumber, '+14155552670');
  assert.equal(historyRequest.token.whatsappSession, 'phone-session');
  assert.deepEqual(historyRequest.options, {
    apiBaseUrl: 'https://waha.example.test',
    apiKey: 'secret',
    limit: 10,
    offset: 0,
  });
  assert.equal(res.body[0].id, '14155552671@c.us');
  assert.deepEqual(res.body[0].lastMessage, {
    id: 'hidden-provider-message',
    body: 'oculto',
  });
});

test('getWhatsAppChatMessages preserves WAHA messages and pagination', async () => {
  const phone = {
    _id: 'phone-1',
    phone: '4155552670',
    countryNumber: '+1',
    owner: 'user-1',
    ownerType: 'User',
    tokens: { whatsapp: 'token-1' },
  };
  const controller = MessageController({
    model: { getHiddenProviderMessageIds: async () => ['hidden-id'] },
    phoneModel: { getById: async () => phone },
    tokenModel: {
      getById: async () => ({
        _id: 'token-1',
        owner: 'user-1',
        phone: 'phone-1',
        whatsappSession: 'phone-session',
      }),
    },
    getWhatsAppChatMessages: async () => [
      { id: 'hidden-id', body: 'oculto', fromMe: true, timestamp: null },
      { id: 'visible-id', body: 'visible', fromMe: false, timestamp: null },
    ],
  });
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  await controller.getWhatsAppChatMessages({
    session: { userId: 'user-1' },
    params: { chatId: '14155552671@c.us' },
    query: { sourcePhoneId: 'phone-1', offset: '10' },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    messages: [
      { id: 'hidden-id', body: 'oculto', fromMe: true, timestamp: null },
      { id: 'visible-id', body: 'visible', fromMe: false, timestamp: null },
    ],
    nextOffset: 12,
    hasMore: false,
  });
});
