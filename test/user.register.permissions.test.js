import test from 'node:test';
import assert from 'node:assert/strict';

import UserController from '../controllers/user/controller.js';
import createdUser from './mocks/user.json' with { type: 'json' };
import permissionDocs from './mocks/permissions.json' with { type: 'json' };

test('register assigns all non-user permissions to the newly created user', async () => {
  const model = {
    save: async (payload) => ({ ...createdUser, ...payload }),
  };

  const permissionModel = {
    getAll: async () => permissionDocs,
  };

  const savedAssignments = [];
  const userPermissionModel = {
    save: async (payload) => {
      savedAssignments.push(payload);
      return payload;
    },
  };

  const controller = UserController({
    entityId: 'User',
    model,
    permissionModel,
    userPermissionModel,
  });

  const req = { body: { name: 'Alice' } };
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  await controller.register(req, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, { ...createdUser, name: 'Alice' });
  assert.deepEqual(savedAssignments, [
    { user: createdUser._id, permission: permissionDocs[0]._id },
    { user: createdUser._id, permission: permissionDocs[1]._id },
  ]);
});
