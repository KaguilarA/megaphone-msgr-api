import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import express from 'express';
import WhatsAppWebhook, { extractIncomingMessages, hasValidSignature } from '../routes/webhooks/whatsapp.js';

test('WhatsApp webhook validates Meta signatures', () => {
  const body = Buffer.from(JSON.stringify({ object: 'whatsapp_business_account' }));
  const secret = 'webhook-secret';
  const digest = createHmac('sha256', secret).update(body).digest('hex');

  assert.equal(hasValidSignature(body, `sha256=${digest}`, secret), true);
  assert.equal(hasValidSignature(body, 'sha256=invalid', secret), false);
});

test('WhatsApp webhook extracts incoming messages from change entries', () => {
  const messages = extractIncomingMessages({
    entry: [{ changes: [{ value: { messages: [{ from: '50660000000', text: { body: 'Hola' } }] } }] }],
  });

  assert.deepEqual(messages, [{ from: '50660000000', text: { body: 'Hola' } }]);
});

test('automatic replies require the token owner to have message permission', async () => {
    let allowed = false;
    const sent = [];
    const app = express();
    app.use(express.raw({ type: 'application/json' }));
    app.use(WhatsAppWebhook({
      appSecret: 'test-secret', autoReplyKeyword: 'hola', autoReplyText: 'Respuesta',
      tokenModel: { getOne: async () => ({ owner: 'user-1' }) },
      permissionModel: { getOne: async () => ({ _id: 'message-register' }) },
      userPermissionModel: { getOne: async ({ user, permission }) =>
        allowed && user === 'user-1' && permission === 'message-register' ? {} : null },
      sendWhatsAppMessage: async (...args) => sent.push(args),
    }));
    const server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    try {
      const body = JSON.stringify({ entry: [{ changes: [{ value: {
        metadata: { phone_number_id: '123' }, messages: [{ from: '50660000000', text: { body: 'Hola' } }],
      } }] }] });
      const signature = createHmac('sha256', 'test-secret').update(body).digest('hex');
      const request = () => fetch(`http://127.0.0.1:${server.address().port}/whatsapp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-hub-signature-256': `sha256=${signature}` }, body,
      });
      assert.equal((await request()).status, 200);
      assert.equal(sent.length, 0);
      allowed = true;
      assert.equal((await request()).status, 200);
      assert.equal(sent.length, 1);
      allowed = false;
      assert.equal((await request()).status, 200);
      assert.equal(sent.length, 1);
    } finally {
      server.close();
    }
});
