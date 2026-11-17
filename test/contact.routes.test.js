import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import ContactRouter from '../routes/contact/routes.js';
import user from './mocks/user.json' with { type: 'json' };

test('GET /contact returns only the contact documents', async () => {
  let childLookupCalled = false;
  const app = express();

  app.use((req, _res, next) => {
    req.session = { userId: user._id };
    next();
  });
  app.use('/contact', ContactRouter({
    id: 'Contact',
    permissionModel: {
      getOne: async ({ entity, name }) => ({ _id: `${entity}-${name}`, entity, name }),
    },
    userPermissionModel: {
      getOne: async () => ({ _id: 'assignment-1' }),
    },
    actions: {
      getById: 'getById',
      getAll: 'getAll',
      post: 'register',
      update: 'updateById',
      delete: 'deleteById',
    },
    model: {
      getByCoincidence: async (query) => {
        assert.deepEqual(query, { owner: user._id });
        return [{ _id: '665f1a2b3c4d5e6f708192c1', name: 'Sofia Hernandez' }];
      },
    },
    emailModel: {
      getByCoincidence: async () => {
        childLookupCalled = true;
        return [];
      },
    },
    phoneNumberModel: {
      getByCoincidence: async () => {
        childLookupCalled = true;
        return [];
      },
    },
    addressModel: {
      getByCoincidence: async () => {
        childLookupCalled = true;
        return [];
      },
    },
  }));

  const server = app.listen(0);
  const { port } = await new Promise((resolve) => server.once('listening', () => resolve(server.address())));
  const response = await fetch(`http://127.0.0.1:${port}/contact`);
  const body = await response.json();
  server.close();

  assert.equal(response.status, 200);
  assert.deepEqual(body, [{ _id: '665f1a2b3c4d5e6f708192c1', name: 'Sofia Hernandez' }]);
  assert.equal(childLookupCalled, false);
});

test('POST /contact creates a contact for the authenticated user', async () => {
  let savedContact;
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.session = { userId: user._id };
    next();
  });
  app.use('/contact', ContactRouter({
    id: 'Contact',
    permissionModel: {
      getOne: async ({ entity, name }) => ({ _id: `${entity}-${name}`, entity, name }),
    },
    userPermissionModel: {
      getOne: async () => ({ _id: 'assignment-1' }),
    },
    actions: {
      getById: 'getById',
      getAll: 'getAll',
      post: 'register',
      update: 'updateById',
      delete: 'deleteById',
    },
    model: {
      save: async (payload) => {
        savedContact = payload;
        return { _id: '665f1a2b3c4d5e6f708192c3', ...payload };
      },
    },
  }));

  const server = app.listen(0);

  try {
    const { port } = await new Promise((resolve) => server.once('listening', () => resolve(server.address())));
    const response = await fetch(`http://127.0.0.1:${port}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Sofia Hernandez' }),
    });

    assert.equal(response.status, 201);
    assert.deepEqual(savedContact, { name: 'Sofia Hernandez', owner: user._id });
  } finally {
    server.close();
  }
});

test('GET /contact/:id returns the requested contact', async () => {
  const contact = { _id: '665f1a2b3c4d5e6f708192c1', name: 'Sofia Hernandez', owner: user._id };
  const app = express();
  app.use((req, _res, next) => {
    req.session = { userId: user._id };
    next();
  });

  app.use('/contact', ContactRouter({
    id: 'Contact',
    permissionModel: { getOne: async ({ entity, name }) => ({ _id: `${entity}-${name}` }) },
    userPermissionModel: { getOne: async () => ({ _id: 'assignment-1' }) },
    actions: { getById: 'getById', getAll: 'getAll', post: 'register', update: 'updateById', delete: 'deleteById' },
    model: { getById: async () => contact },
  }));

  const server = app.listen(0);
  try {
    const { port } = await new Promise((resolve) => server.once('listening', () => resolve(server.address())));
    const response = await fetch(`http://127.0.0.1:${port}/contact/${contact._id}`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), contact);
  } finally {
    server.close();
  }
});

test('contact reads and writes cannot access another user contact', async () => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { req.session = { userId: user._id }; next(); });
  let writes = 0;
  app.use('/contact', ContactRouter({
    id: 'Contact',
    permissionModel: { getOne: async ({ entity, name }) => ({ _id: `${entity}-${name}` }) },
    userPermissionModel: { getOne: async () => ({ _id: 'assignment' }) },
    actionLogModel: { save: async () => {} },
    actions: { getById: 'getById', getAll: 'getAll', post: 'register', update: 'updateById', delete: 'deleteById' },
    model: {
      getById: async () => ({ owner: 'another-user' }),
      update: async () => { writes++; },
      delete: async () => { writes++; },
    },
  }));
  const server = app.listen(0);
  try {
    const { port } = await new Promise((resolve) => server.once('listening', () => resolve(server.address())));
    for (const method of ['GET', 'PUT', 'DELETE']) {
      const response = await fetch(`http://127.0.0.1:${port}/contact/123`, { method });
      assert.equal(response.status, 404);
    }
    assert.equal(writes, 0);
  } finally {
    server.close();
  }
});

test('updating an owned contact cannot change its owner', async () => {
  const { default: ContactController } = await import('../controllers/contact/controller.js');
  let updates;
  const controller = ContactController({ model: {
    getById: async () => ({ owner: user._id }),
    update: async (_id, data) => { updates = data; return data; },
  } });
  const res = { status() { return this; }, json() { return this; } };
  await controller.updateById({ session: { userId: user._id }, params: { id: '123' }, body: { name: 'Ana', owner: 'another-user' } }, res);
  assert.deepEqual(updates, { name: 'Ana' });
});