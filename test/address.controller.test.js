import test from 'node:test';
import assert from 'node:assert/strict';

import AddressController from '../controllers/address/controller.js';
import addressPayload from './mocks/address.json' with { type: 'json' };
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
    end() {
      this.ended = true;
      return this;
    },
  };
}

test('registerUserAddress associates the address with the authenticated user', async () => {
  let savedAddress;
  const controller = AddressController({
    id: 'Address',
    model: {
      save: async (payload) => {
        savedAddress = payload;
        return { _id: '665f1a2b3c4d5e6f70819400', ...payload };
      },
    },
  });
  const res = createRes();

  await controller.registerUserAddress({
    session: { userId: user._id },
    body: addressPayload,
  }, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(savedAddress, {
    ...addressPayload,
    ownerType: 'User',
    owner: user._id,
  });
  assert.equal(res.body.owner, user._id);
});

test('getContactAddresses filters addresses by contact owner', async () => {
  let filter;
  const controller = AddressController({
    id: 'Address',
    model: {
      getByCoincidence: async (query) => {
        filter = query;
        return [{ _id: '665f1a2b3c4d5e6f70819401', owner: '665f1a2b3c4d5e6f708192c1' }];
      },
    },
  });
  const res = createRes();

  await controller.getContactAddresses({ params: { id: '665f1a2b3c4d5e6f708192c1' } }, res);

  assert.deepEqual(filter, { owner: '665f1a2b3c4d5e6f708192c1', ownerType: 'Contact' });
  assert.deepEqual(res.body, [{ _id: '665f1a2b3c4d5e6f70819401', owner: '665f1a2b3c4d5e6f708192c1' }]);
});
