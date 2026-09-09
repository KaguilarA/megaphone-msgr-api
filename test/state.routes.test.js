import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';

import StateRouter from '../routes/state/routes.js';
import statePayload from './mocks/state.json' with { type: 'json' };
import user from './mocks/user.json' with { type: 'json' };

function createApp(session, hasPermission = true) {
  const savedStates = [];
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.session = session;
    next();
  });
  app.use('/state', StateRouter({
    entityId: 'State',
    model: {
      getAll: async () => [{ _id: 'state-1', ...statePayload }],
      save: async (payload) => {
        savedStates.push(payload);
        return { _id: 'state-1', ...payload };
      },
    },
    permissionModel: {
      getOne: async ({ entity, name }) => ({
        _id: name === 'getAll' ? '665f1a2b3c4d5e6f70819801' : '665f1a2b3c4d5e6f70819802',
        entity,
        name,
      }),
    },
    userPermissionModel: {
      getOne: async () => hasPermission ? { _id: '665f1a2b3c4d5e6f70819901' } : null,
    },
    actionLogModel: {
      save: async () => ({}),
    },
    actions: {
      getAll: 'getAll',
      getByCoincidence: 'getByCoincidence',
      post: 'register',
    },
  }));
  app.locals.savedStates = savedStates;
  return app;
}

test('GET /state returns the available states for an authenticated request', async () => {
  const app = createApp({ userId: user._id });
  const server = app.listen(0);

  try {
    const { port } = await new Promise((resolve) =>
      server.once('listening', () => resolve(server.address())),
    );
    const response = await fetch(`http://127.0.0.1:${port}/state`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [{ _id: 'state-1', ...statePayload }]);
  } finally {
    server.close();
  }
});

test('POST /state saves a state payload for an authenticated request', async () => {
  const app = createApp({ userId: user._id });
  const server = app.listen(0);

  try {
    const { port } = await new Promise((resolve) =>
      server.once('listening', () => resolve(server.address())),
    );
    const response = await fetch(`http://127.0.0.1:${port}/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statePayload),
    });

    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { _id: 'state-1', ...statePayload });
    assert.deepEqual(app.locals.savedStates, [statePayload]);
  } finally {
    server.close();
  }
});

test('GET /state rejects unauthenticated requests', async () => {
  const app = createApp({});
  const server = app.listen(0);

  try {
    const { port } = await new Promise((resolve) =>
      server.once('listening', () => resolve(server.address())),
    );
    const response = await fetch(`http://127.0.0.1:${port}/state`);

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
      authenticated: false,
      error: 'No autorizado',
    });
  } finally {
    server.close();
  }
});

test('GET /state rejects an authenticated request without getAll permission', async () => {
  const app = createApp({ userId: user._id }, false);
  const server = app.listen(0);

  try {
    const { port } = await new Promise((resolve) =>
      server.once('listening', () => resolve(server.address())),
    );
    const response = await fetch(`http://127.0.0.1:${port}/state`);

    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), {
      message: 'No tienes permisos para ejecutar esta acción.',
    });
  } finally {
    server.close();
  }
});
