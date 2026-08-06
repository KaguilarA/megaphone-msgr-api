import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMetaPayload, resolveMetaSettings } from '../controllers/message.js';

test('buildMetaPayload creates the expected Meta WhatsApp payload', () => {
  const payload = buildMetaPayload({ recipientPhone: '123456789', content: 'Hola' });

  assert.deepEqual(payload, {
    messaging_product: 'whatsapp',
    to: '123456789',
    type: 'text',
    text: {
      body: 'Hola',
    },
  });
});

test('resolveMetaSettings prefers the authenticated user token and phone id', () => {
  const settings = resolveMetaSettings(
    {
      to: '111111111',
      content: 'Mensaje',
      phoneNumberId: 'phone-1',
    },
    {
      tokens: {
        whatsappToken: 'user-token',
      },
    },
  );

  assert.equal(settings.recipientPhone, '111111111');
  assert.equal(settings.content, 'Mensaje');
  assert.equal(settings.token, 'user-token');
  assert.equal(settings.phoneNumberId, 'phone-1');
});

test('resolveMetaSettings falls back to body values when user token is missing', () => {
  const settings = resolveMetaSettings({
    to: '222222222',
    message: 'Fallback',
    whatsappToken: 'body-token',
    phoneNumberId: 'phone-2',
  });

  assert.equal(settings.recipientPhone, '222222222');
  assert.equal(settings.content, 'Fallback');
  assert.equal(settings.token, 'body-token');
  assert.equal(settings.phoneNumberId, 'phone-2');
});
