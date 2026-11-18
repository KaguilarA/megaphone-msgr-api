import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import ContactRouter from '../routes/contact/routes.js';
import ContactData from '../models/contact/model.js';
import user from './mocks/user.json' with { type: 'json' };

test('contact names are optional in the schema', () => {
  assert.equal(ContactData.model.name.required, undefined);
});

test('GET /contact includes owned contact phone numbers', async () => {
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
    actionLogModel: { save: async () => {} },
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
      getByCoincidence: async (filter) => {
        assert.deepEqual(filter, {
          ownerType: 'Contact',
          owner: { $in: ['665f1a2b3c4d5e6f708192c1'] },
        });
        return [{ _id: 'phone-1', owner: '665f1a2b3c4d5e6f708192c1', phone: '5512345678', countryNumber: '+52' }];
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
  assert.deepEqual(body, [{
    _id: '665f1a2b3c4d5e6f708192c1',
    name: 'Sofia Hernandez',
    phoneNumbers: [{ _id: 'phone-1', owner: '665f1a2b3c4d5e6f708192c1', phone: '5512345678', countryNumber: '+52' }],
  }]);
  assert.equal(childLookupCalled, false);
});

test('POST /contact requires at least one phone number', async () => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { req.session = { userId: user._id }; next(); });
  app.use('/contact', ContactRouter({
    id: 'Contact',
    permissionModel: { getOne: async () => ({ _id: 'contact-register' }) },
    userPermissionModel: { getOne: async () => ({ _id: 'assignment' }) },
    actionLogModel: { save: async () => {} },
    actions: { post: 'register' },
    model: { save: async () => assert.fail('must not create a contact') },
    phoneNumberModel: { save: async () => assert.fail('must not create a phone') },
  }));
  const server = app.listen(0);
  try {
    const { port } = await new Promise((resolve) => server.once('listening', () => resolve(server.address())));
    const response = await fetch(`http://127.0.0.1:${port}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /teléfono/);
  } finally {
    server.close();
  }
});

test('POST /contact creates a phone-only contact for the authenticated user', async () => {
  let savedContact;
  const savedPhones = [];
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
    actionLogModel: { save: async () => {} },
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
      delete: async () => {},
    },
    phoneNumberModel: {
      save: async (payload) => {
        savedPhones.push(payload);
        return { _id: 'phone-1', ...payload };
      },
      delete: async () => {},
    },
  }));

  const server = app.listen(0);

  try {
    const { port } = await new Promise((resolve) => server.once('listening', () => resolve(server.address())));
    const response = await fetch(`http://127.0.0.1:${port}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumbers: [{ phone: '5512345678', countryNumber: '+52' }] }),
    });

    assert.equal(response.status, 201);
    assert.deepEqual(savedContact, { owner: user._id });
    assert.equal(savedPhones.length, 1);
    assert.equal(savedPhones[0].ownerType, 'Contact');
    assert.equal(savedPhones[0].e164, '+525512345678');
    assert.equal((await response.json()).phoneNumbers.length, 1);
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

test('deleting a contact removes its phone records so they can be imported again', async () => {
  const deletedPhones = [];
  let deletedContact;
  const controller = (await import('../controllers/contact/controller.js')).default({
    model: {
      getById: async () => ({ _id: 'contact-1', owner: user._id }),
      delete: async (id) => { deletedContact = id; },
    },
    phoneNumberModel: {
      getByCoincidence: async (filter) => {
        assert.deepEqual(filter, { owner: 'contact-1', ownerType: 'Contact' });
        return [{ _id: 'phone-1' }, { _id: 'phone-2' }];
      },
      delete: async (id) => deletedPhones.push(id),
    },
  });
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    end() {},
  };
  await controller.deleteById({
    session: { userId: user._id },
    params: { id: 'contact-1' },
  }, res);

  assert.equal(res.statusCode, 204);
  assert.deepEqual(deletedPhones, ['phone-1', 'phone-2']);
  assert.equal(deletedContact, 'contact-1');
});