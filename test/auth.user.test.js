import test from 'node:test';
import assert from 'node:assert/strict';
import AuthController from '../controllers/auth/controller.js';
import UserController from '../controllers/user/controller.js';

function createRes() {
  const res = {
    statusCode: 200,
    body: null,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    clearCookie() {
      this.headers.cookieCleared = true;
      return this;
    },
  };

  return res;
}

test('auth login returns 401 for invalid credentials', async () => {
  const emailModel = {
    getOne: async () => null,
  };
  const userModel = {
    getOne: async () => null,
    compareHash: async () => false,
  };

  const controller = AuthController({
    id: 'auth',
    models: [{ model: userModel }, { model: emailModel }],
  });

  const req = {
    body: { email: 'user@example.com', password: 'wrong' },
    session: { save: (cb) => cb(null) },
  };
  const res = createRes();

  await controller.logIn(req, res);

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: 'Credenciales inválidas.' });
});

test('auth status returns authenticated when req.user exists', async () => {
  const controller = AuthController({
    id: 'auth',
    models: [{ model: {} }, { model: {} }],
  });

  const req = {
    session: { userId: '123' },
    user: { _id: '123', toJSON: () => ({ _id: '123' }) },
  };
  const res = createRes();

  await controller.status(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    authenticated: true,
    user: { _id: '123' },
  });
});

test('user getInfo returns the current user profile', async () => {
  const user = { _id: 'abc', name: 'Test' };
  const model = {
    getById: async () => user,
  };

  const controller = UserController({
    entityId: 'User',
    model,
    populatedFields: ['tokens'],
  });

  const req = {
    session: { userId: 'abc' },
  };
  const res = createRes();

  await controller.getInfo(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, user);
});

test('user update returns 404 when the user cannot be found', async () => {
  const model = {
    update: async () => null,
  };

  const controller = UserController({
    entityId: 'User',
    model,
    populatedFields: [],
  });

  const req = {
    session: { userId: 'abc' },
    body: { name: 'Updated' },
  };
  const res = createRes();

  await controller.update(req, res);

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { message: 'User not found.' });
});
