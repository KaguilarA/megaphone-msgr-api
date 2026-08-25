import test from 'node:test';
import assert from 'node:assert/strict';

import { actionLogMiddleware, requirePermission } from '../middlewares/permissionMiddleware.js';
import user from './mocks/user.json' with { type: 'json' };
import permissionDocs from './mocks/permissions.json' with { type: 'json' };

test('requirePermission allows the request when the user has the required permission', async () => {
  const req = {
    session: { userId: user._id },
  };
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

  const middleware = requirePermission('read_permission', {
    permissionModel: {
      getOne: async ({ name }) => ({ ...permissionDocs[0], name }),
    },
    userPermissionModel: {
      getOne: async ({ user: userId, permission }) => ({ user: userId, permission }),
    },
    action: 'read_permission',
  });

  let nextCalled = false;

  await middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.permissionName, 'read_permission');
  assert.equal(req.permissionAction, 'read_permission');
});

test('actionLogMiddleware records the action after a successful json response', async () => {
  const savedLogs = [];
  const req = {
    method: 'POST',
    originalUrl: '/permissions',
    session: { userId: user._id },
    permission: { _id: permissionDocs[1]._id },
    permissionName: 'create_permission',
    permissionAction: 'create_permission',
    body: { name: 'Admin' },
    params: {},
    query: {},
  };

  const res = {
    statusCode: 201,
    json(body) {
      this.body = body;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
  };

  const middleware = actionLogMiddleware({
    actionLogModel: {
      save: async (entry) => savedLogs.push(entry),
    },
    action: 'create_permission',
  });

  middleware(req, res, () => {});
  await res.json({ ok: true });

  assert.equal(savedLogs.length, 1);
  assert.equal(savedLogs[0].user, user._id);
  assert.equal(savedLogs[0].permission, permissionDocs[1]._id);
  assert.equal(savedLogs[0].action, 'create_permission');
  assert.equal(savedLogs[0].metadata.statusCode, 201);
});