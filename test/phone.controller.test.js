import test from 'node:test';
import assert from 'node:assert/strict';

import PhoneController from '../controllers/phone/controller.js';
import phonePayload from './mocks/phone.json' with { type: 'json' };
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

test('registerUserPhoneNumber associates the phone with the authenticated user', async () => {
  let savedPhone;
  const controller = PhoneController({
    id: 'Phone Number',
    model: {
      save: async (payload) => {
        savedPhone = payload;
        return { _id: '665f1a2b3c4d5e6f70819420', ...payload };
      },
    },
  });
  const res = createRes();

  await controller.registerUserPhoneNumber({
    session: { userId: user._id },
    body: phonePayload,
  }, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(savedPhone, {
    ...phonePayload,
    ownerType: 'User',
    owner: user._id,
  });
  assert.equal(res.body.owner, user._id);
});

test('getContactPhoneNumber filters phone numbers by contact owner', async () => {
  let filter;
  const controller = PhoneController({
    id: 'Phone Number',
    model: {
      getByCoincidence: async (query) => {
        filter = query;
        return [{ _id: '665f1a2b3c4d5e6f70819403', owner: '665f1a2b3c4d5e6f708192c1' }];
      },
    },
  });
  const res = createRes();

  await controller.getContactPhoneNumber({ params: { id: '665f1a2b3c4d5e6f708192c1' } }, res);

  assert.deepEqual(filter, { owner: '665f1a2b3c4d5e6f708192c1', ownerType: 'Contact' });
  assert.deepEqual(res.body, [{ _id: '665f1a2b3c4d5e6f70819403', owner: '665f1a2b3c4d5e6f708192c1' }]);
});
