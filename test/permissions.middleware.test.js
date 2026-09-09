import test from 'node:test';
import assert from 'node:assert/strict';

import actionLogMiddleware from "./../middlewares/actionLog/actionLog.js";
import requirePermission from "../middlewares/permission/permission.js";
import user from './mocks/user.json' with { type: 'json' };
import permissionDocs from './mocks/permissions.json' with { type: 'json' };

test('requirePermission allows the request when the user has the required permission', async () => {
  let permissionQuery;
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
    entity: 'Contact',
    permissionModel: {
      getOne: async (query) => {
        permissionQuery = query;
        return { ...permissionDocs[0], ...query };
      },
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
  assert.deepEqual(permissionQuery, {
    entity: 'Contact',
    name: 'read_permission',
  });
  assert.equal(req.permissionEntity, 'Contact');
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
    end(body) {
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

test('actionLogMiddleware records the action after an end response', async () => {
  const savedLogs = [];
  const req = {
    method: 'DELETE',
    originalUrl: '/contact/665f1a2b3c4d5e6f708192c1',
    session: { userId: user._id },
    permission: { _id: permissionDocs[0]._id },
    permissionAction: 'delete',
    permissionName: 'delete',
    permissionEntity: 'Contact',
    body: {},
    params: { id: '665f1a2b3c4d5e6f708192c1' },
    query: {},
  };
  const res = {
    statusCode: 204,
    json() { return this; },
    send() { return this; },
    end() {
      this.ended = true;
      return this;
    },
  };

  const middleware = actionLogMiddleware({
    actionLogModel: { save: async (entry) => savedLogs.push(entry) },
    action: 'delete',
  });

  middleware(req, res, () => {});
  await res.end();

  assert.equal(res.ended, true);
  assert.equal(savedLogs.length, 1);
  assert.equal(savedLogs[0].action, 'delete');
  assert.equal(savedLogs[0].metadata.statusCode, 204);
});

test('actionLogMiddleware resolves a permission with separate entity and action', async () => {
  const savedLogs = [];
  let permissionQuery;
  const req = {
    method: 'DELETE',
    originalUrl: '/contact/contact-id',
    session: { userId: user._id },
    permissionEntity: 'Contact',
  };
  const res = {
    statusCode: 204,
    json() { return this; },
    send() { return this; },
    end() { return this; },
  };

  const middleware = actionLogMiddleware({
    actionLogModel: { save: async (entry) => savedLogs.push(entry) },
    permissionModel: {
      getOne: async (query) => {
        permissionQuery = query;
        return { _id: permissionDocs[0]._id };
      },
    },
    entity: 'Contact',
    action: 'delete',
  });

  middleware(req, res, () => {});
  await res.end();

  assert.deepEqual(permissionQuery, { entity: 'Contact', name: 'delete' });
  assert.equal(savedLogs[0].action, 'delete');
});
