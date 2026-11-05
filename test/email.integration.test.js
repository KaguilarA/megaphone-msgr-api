import test from 'node:test';
import assert from 'node:assert/strict';
import { sendEmail } from '../integrations/email.js';

test('Nodemailer sends using SMTP config and hides recipients in BCC', async () => {
  let transportOptions;
  let message;
  const config = {
    email: 'sender@example.com',
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    smtpUser: 'sender@example.com',
    smtpPassword: 'secret',
    smtpSecure: false,
    smtpFromName: 'Megaphone',
  };

  const result = await sendEmail(config, {
    to: config.email,
    bcc: ['one@example.com', 'two@example.com'],
    subject: 'Notice',
    text: 'Hello',
  }, {
    createTransport: (options) => {
      transportOptions = options;
      return { sendMail: async (mail) => { message = mail; return { messageId: 'test-message' }; } };
    },
  });

  assert.equal(transportOptions.host, config.smtpHost);
  assert.equal(transportOptions.port, 587);
  assert.equal(transportOptions.auth.pass, config.smtpPassword);
  assert.deepEqual(message.bcc, ['one@example.com', 'two@example.com']);
  assert.equal(message.from.address, config.email);
  assert.equal(result.messageId, 'test-message');
});

test('Nodemailer refuses incomplete SMTP configuration', async () => {
  await assert.rejects(
    sendEmail({ email: 'sender@example.com' }, { to: 'recipient@example.com', subject: 'Notice', text: 'Hello' }),
    /complete SMTP configuration/,
  );
});