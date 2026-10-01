import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { extractIncomingMessages, hasValidSignature } from '../routes/webhooks/whatsapp.js';

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
