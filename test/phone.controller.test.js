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
  const activeState = { _id: '665f1a2b3c4d5e6f70819602', name: 'active', type: 'phone' };
  const controller = PhoneController({
    id: 'Phone Number',
    model: {
      save: async (payload) => {
        savedPhone = payload;
        return { _id: '665f1a2b3c4d5e6f70819420', ...payload };
      },
    },
    stateModel: {
      getOne: async () => activeState,
    },
  });
  const res = createRes();

  await controller.registerUserPhoneNumber({
    session: { userId: user._id },
    body: {
      phone: phonePayload.phone,
      countryNumber: phonePayload.countryNumber,
    },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(savedPhone, {
    phone: phonePayload.phone,
    countryNumber: phonePayload.countryNumber,
    ownerType: 'User',
    owner: user._id,
    state: [activeState._id],
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

test('registerUserPhoneNumber allows a second phone for the same user', async () => {
  const savedPhones = [];
  const controller = PhoneController({
    id: 'Phone Number',
    model: {
      save: async (payload) => {
        savedPhones.push(payload);
        return { _id: `phone-${savedPhones.length}`, ...payload };
      },
    },
    stateModel: {
      getOne: async () => ({ _id: 'active-state' }),
    },
  });
  const req = {
    session: { userId: user._id },
    body: { phone: '5550001', countryNumber: '+52' },
  };

  await controller.registerUserPhoneNumber(req, createRes());
  await controller.registerUserPhoneNumber({
    ...req,
    body: { phone: '5550002', countryNumber: '+52' },
  }, createRes());

  assert.equal(savedPhones.length, 2);
  assert.equal(savedPhones[1].phone, '5550002');
  assert.equal(savedPhones[1].owner, user._id);
});
