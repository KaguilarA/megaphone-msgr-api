import test from 'node:test';
import assert from 'node:assert/strict';
import AmpApiCripto from '../db/utils/crypto.js';

test('encrypt/decrypt round trip preserves the original value', () => {
  const crypto = AmpApiCripto;
  const plaintext = 'secret-value';

  const encrypted = crypto.encrypt(plaintext);

  assert.notEqual(encrypted, plaintext);
  assert.equal(crypto.decrypt(encrypted), plaintext);
  assert.equal(crypto.isEncrypted(encrypted), true);
});

test('isEncrypted returns false for non-encrypted values', () => {
  assert.equal(AmpApiCripto.isEncrypted('plain text'), false);
});
