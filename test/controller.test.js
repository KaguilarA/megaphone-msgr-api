import test from 'node:test';
import assert from 'node:assert/strict';
import ControllerFactory from '../controllers/controller.js';

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

test('generic controller getAll returns the collection from the model', async () => {
  const items = [{ _id: '1' }];
  const controller = ControllerFactory({
    entityId: 'Item',
    model: {
      getAll: async () => items,
    },
  });

  const req = {};
  const res = createRes();

  await controller.getAll(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, items);
});

test('generic controller getById returns 404 when the entity is missing', async () => {
  const controller = ControllerFactory({
    entityId: 'Item',
    model: {
      getById: async () => null,
    },
  });

  const req = { params: { id: 'missing' } };
  const res = createRes();

  await controller.getById(req, res);

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { message: 'Item not found.' });
});

test('generic controller register creates a new entity', async () => {
  const created = { _id: '2', name: 'Created' };
  const controller = ControllerFactory({
    entityId: 'Item',
    model: {
      save: async (payload) => ({ ...created, ...payload }),
    },
  });

  const req = { body: { name: 'Created' } };
  const res = createRes();

  await controller.register(req, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, { _id: '2', name: 'Created' });
});

test('generic controller update returns the updated entity', async () => {
  const updated = { _id: '3', name: 'Updated' };
  const controller = ControllerFactory({
    entityId: 'Item',
    model: {
      update: async () => updated,
    },
  });

  const req = { params: { id: '3' }, body: { name: 'Updated' } };
  const res = createRes();

  await controller.update(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, updated);
});

test('generic controller delete removes an entity', async () => {
  const controller = ControllerFactory({
    entityId: 'Item',
    model: {
      delete: async () => ({ _id: '4' }),
    },
  });

  const req = { params: { id: '4' } };
  const res = createRes();

  await controller.delete(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { message: 'Item removed.' });
});
