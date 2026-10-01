import test from 'node:test';
import assert from 'node:assert/strict';

import UserController from '../controllers/user/controller.js';
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

test('getAll returns the user list', async () => {
  const users = [{ ...user }];
  const controller = UserController({
    entityId: 'User',
    model: { getAll: async () => users },
  });
  const res = createRes();

  await controller.getAll({}, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, users);
});

test('getPermissions returns assignments populated with permission data', async () => {
  const assignments = [{
    _id: '665f1a2b3c4d5e6f70819901',
    user: user._id,
    permission: { _id: '665f1a2b3c4d5e6f70819902', name: 'contact:getList' },
  }];
  let query;
  const controller = UserController({
    entityId: 'User',
    model: {},
    userPermissionModel: {
      getByCoincidence: async (filter, options) => {
        query = { filter, options };
        return assignments;
      },
    },
  });
  const res = createRes();

  await controller.getPermissions({ params: { id: user._id } }, res);

  assert.deepEqual(query, {
    filter: { user: user._id },
    options: { populate: 'permission' },
  });
  assert.deepEqual(res.body, assignments);
});

test('updatePermissions removes missing assignments and creates new ones', async () => {
  const existing = [
    { _id: '665f1a2b3c4d5e6f70819903', user: user._id, permission: '665f1a2b3c4d5e6f70819904' },
    { _id: '665f1a2b3c4d5e6f70819905', user: user._id, permission: '665f1a2b3c4d5e6f70819906' },
  ];
  const deleted = [];
  const created = [];
  const controller = UserController({
    entityId: 'User',
    model: {},
    userPermissionModel: {
      getByCoincidence: async (filter, options) => options ? [] : existing,
      delete: async (id) => deleted.push(id),
      save: async (payload) => created.push(payload),
    },
  });
  const res = createRes();

  await controller.updatePermissions({
    params: { id: user._id },
    body: { permissionIds: ['665f1a2b3c4d5e6f70819906', '665f1a2b3c4d5e6f70819907'] },
  }, res);

  assert.deepEqual(deleted, ['665f1a2b3c4d5e6f70819903']);
  assert.deepEqual(created, [{
    user: user._id,
    permission: '665f1a2b3c4d5e6f70819907',
  }]);
  assert.equal(res.statusCode, 200);
});

test('updatePermissions rejects unknown permission ids before changing assignments', async () => {
  let changed = false;
  const controller = UserController({
    entityId: 'User',
    model: {},
    permissionModel: {
      getById: async () => null,
    },
    userPermissionModel: {
      getByCoincidence: async () => {
        changed = true;
        return [];
      },
    },
  });
  const res = createRes();

  await controller.updatePermissions({
    params: { id: user._id },
    body: { permissionIds: ['missing-permission'] },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(changed, false);
  assert.match(res.body.error, /do not exist/);
});
