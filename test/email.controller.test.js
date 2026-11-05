import test from 'node:test';
import assert from 'node:assert/strict';

import EmailController from '../controllers/email/controller.js';
import emailPayload from './mocks/email.json' with { type: 'json' };
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

test('registerUserEmail associates the email with the authenticated user', async () => {
  let savedEmail;
  const activeState = { _id: '665f1a2b3c4d5e6f70819601', name: 'active', type: 'email' };
  const controller = EmailController({
    id: 'Email',
    model: {
      save: async (payload) => {
        savedEmail = payload;
        return { _id: '665f1a2b3c4d5e6f70819410', ...payload };
      },
    },
    stateModel: {
      getOne: async () => activeState,
    },
  });
  const res = createRes();

  await controller.registerUserEmail({
    session: { userId: user._id },
    body: { email: emailPayload.email },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(savedEmail, {
    email: emailPayload.email,
    ownerType: 'User',
    owner: user._id,
    state: activeState._id,
  });
  assert.equal(res.body.owner, user._id);
});

test('getContactEmail filters emails by contact owner', async () => {
  let filter;
  const controller = EmailController({
    id: 'Email',
    model: {
      getByCoincidence: async (query) => {
        filter = query;
        return [{ _id: '665f1a2b3c4d5e6f70819402', owner: '665f1a2b3c4d5e6f708192c1' }];
      },
    },
  });
  const res = createRes();

  await controller.getContactEmail({ params: { id: '665f1a2b3c4d5e6f708192c1' } }, res);

  assert.deepEqual(filter, { owner: '665f1a2b3c4d5e6f708192c1', ownerType: 'Contact' });
  assert.deepEqual(res.body, [{ _id: '665f1a2b3c4d5e6f70819402', owner: '665f1a2b3c4d5e6f708192c1' }]);
});

test('configureSmtp stores SMTP settings without returning the password', async () => {
  let updated;
  const controller = EmailController({
    model: {
      getOne: async () => ({ _id: 'email-1', email: 'sender@example.com' }),
      update: async (_id, data) => { updated = data; return { _id: 'email-1', email: 'sender@example.com', ...data }; },
    },
  });
  const res = createRes();

  await controller.configureSmtp({
    session: { userId: user._id },
    body: { smtpHost: 'smtp.example.com', smtpPort: '587', smtpUser: 'sender@example.com', smtpPassword: 'mail-secret', smtpSecure: false },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(updated.smtpPort, 587);
  assert.equal(updated.smtpPassword, 'mail-secret');
  assert.equal(res.body.hasSmtpPassword, true);
  assert.equal(Object.hasOwn(res.body, 'smtpPassword'), false);
});

test('sendToContacts delivers to owned contact addresses as BCC', async () => {
  let delivery;
  const sender = { email: 'sender@example.com', smtpHost: 'smtp.example.com', smtpPassword: 'mail-secret' };
  const contactId = '665f1a2b3c4d5e6f708192c1';
  const controller = EmailController({
    model: {
      getOne: async () => sender,
      getByCoincidence: async () => [{ email: 'recipient@example.com' }],
    },
    contactModel: { getById: async () => ({ _id: contactId, owner: user._id }) },
    sendEmail: async (config, message) => { delivery = { config, message }; return { messageId: 'mail-1' }; },
  });
  const res = createRes();

  await controller.sendToContacts({
    session: { userId: user._id },
    body: { contactIds: [contactId], subject: 'Aviso', text: 'Contenido' },
  }, res);

  assert.equal(res.statusCode, 202);
  assert.equal(delivery.config, sender);
  assert.deepEqual(delivery.message.bcc, ['recipient@example.com']);
  assert.equal(delivery.message.to, sender.email);
  assert.deepEqual(res.body, { accepted: 1, messageId: 'mail-1' });
});

test('sendToContacts rejects contacts owned by another user', async () => {
  const controller = EmailController({
    model: { getOne: async () => ({ email: 'sender@example.com', smtpHost: 'smtp.example.com', smtpPassword: 'secret' }) },
    contactModel: { getById: async () => ({ owner: 'another-user' }) },
    sendEmail: async () => assert.fail('Email must not be sent'),
  });
  const res = createRes();

  await controller.sendToContacts({
    session: { userId: user._id },
    body: { contactIds: ['contact-1'], subject: 'Aviso', text: 'Contenido' },
  }, res);

  assert.equal(res.statusCode, 403);
});
