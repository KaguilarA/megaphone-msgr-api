import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import MessageRouter from '../routes/message.routes.js';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.user = {
      _id: 'user-1',
      tokens: { whatsappToken: 'route-token' },
    };
    next();
  });
  app.use('/message', MessageRouter({
    entityId: 'Message',
    model: {
      save: async (data) => ({ ...data, _id: 'msg-route' }),
    },
  }));
  return app;
}

test('POST /message/send returns 201 and uses the authenticated user token', async () => {
  const originalFetch = global.fetch;
  let capturedUrl = null;
  let capturedHeaders = null;
  let capturedBody = null;

  global.fetch = async (url, options) => {
    if (typeof url === 'string' && url.startsWith('http://127.0.0.1')) {
      return originalFetch(url, options);
    }

    capturedUrl = url;
    capturedHeaders = options.headers;
    capturedBody = JSON.parse(options.body);

    return {
      ok: true,
      status: 200,
      json: async () => ({ success: true, message_id: 'route-meta' }),
    };
  };

  try {
    const app = createApp();
    const server = app.listen(0);

    const { port } = await new Promise((resolve) => server.once('listening', () => resolve(server.address())));
    const response = await global.fetch(`http://127.0.0.1:${port}/message/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: '500000000',
        content: 'Hello route',
        phoneNumberId: 'phone-route',
        receiver: ['contact-route'],
      }),
    });

    const body = await response.json();
    server.close();

    assert.equal(response.status, 201);
    assert.equal(body.message, 'Mensaje enviado correctamente.');
    assert.equal(capturedHeaders.Authorization, 'Bearer route-token');
    assert.equal(capturedBody.to, '500000000');
    assert.match(capturedUrl, /phone-route\/messages$/);
  } finally {
    global.fetch = originalFetch;
  }
});
