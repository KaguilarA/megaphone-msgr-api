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
