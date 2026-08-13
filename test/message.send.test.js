import test from 'node:test';
import assert from 'node:assert/strict';
import MessageController from '../controllers/message.js';

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

test('send returns 201 and saves the message when Meta responds successfully', async () => {
  const savedMessages = [];
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => ({
    ok: true,
    status: 200,
    url,
    options,
    json: async () => ({ success: true, message_id: 'meta-123' }),
  });

  try {
    const controller = MessageController({
      entityId: 'Message',
      model: {
        save: async (data) => {
          savedMessages.push(data);
          return { ...data, _id: 'msg-1' };
        },
      },
    });

    const req = {
      body: {
        to: '123456789',
        content: 'Hola desde test',
        phoneNumberId: 'phone-123',
        receiver: ['contact-1'],
      },
      session: {
        userId: 'user-1',
      },
      user: {
        _id: 'user-1',
        tokens: {
          whatsappToken: 'secret-token',
        },
      },
    };
    const res = createRes();

    await controller.send(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.message, 'Mensaje enviado correctamente.');
    assert.equal(res.body.meta.success, true);
    assert.equal(savedMessages.length, 1);
    assert.equal(savedMessages[0].content, 'Hola desde test');
    assert.equal(savedMessages[0].receiver[0], 'contact-1');
    assert.equal(savedMessages[0].sender, 'user-1');
    assert.match(res.body.meta.message_id, /meta-123/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('send returns 400 when required fields are missing', async () => {
  const controller = MessageController({
    entityId: 'Message',
    model: { save: async () => null },
  });

  const req = {
    body: {},
    user: {
      tokens: {
        whatsappToken: 'secret-token',
      },
    },
  };
  const res = createRes();

  await controller.send(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Se requiere el número de destino en el campo 'to'.");
});
