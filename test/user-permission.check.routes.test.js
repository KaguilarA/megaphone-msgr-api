import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';

import UserPermissionRouter from '../routes/userPermission/routes.js';
import user from './mocks/user.json' with { type: 'json' };
import permissionDocs from './mocks/permissions.json' with { type: 'json' };

function createApp({ permission, assignment }) {
  const app = express();
  app.use((req, _res, next) => {
    req.session = { userId: user._id };
    next();
  });
  app.use('/user-permission', UserPermissionRouter({
    model: {},
    permissionModel: {
      getOne: async () => permission,
    },
    userPermissionModel: {
      getOne: async () => assignment,
    },
  }));
  return app;
}

async function requestCheck(app, permissionName) {
  const server = app.listen(0);
  try {
    const { port } = await new Promise((resolve) =>
      server.once('listening', () => resolve(server.address())),
    );
    const response = await fetch(`http://127.0.0.1:${port}/user-permission/check/${permissionName}`);
    return {
      status: response.status,
      body: await response.json(),
    };
  } finally {
    server.close();
  }
}

test('GET /user-permission/check/:permission returns true for an assigned permission', async () => {
  const permission = permissionDocs[0];
  const response = await requestCheck(createApp({ permission, assignment: { _id: '665f1a2b3c4d5e6f70819701' } }), permission.name);

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { allowed: true });
});

test('GET /user-permission/check/:permission returns false without an assignment', async () => {
  const permission = permissionDocs[0];
  const response = await requestCheck(createApp({ permission, assignment: null }), permission.name);

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { allowed: false });
});

test('GET /user-permission/check/:permission returns false for an unknown permission', async () => {
  const response = await requestCheck(createApp({ permission: null, assignment: null }), 'contact:delete');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { allowed: false });
});