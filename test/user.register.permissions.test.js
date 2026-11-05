import test from 'node:test';
import assert from 'node:assert/strict';
import UserController from '../controllers/user/controller.js';

const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test('user registration delegates to the transactional account service', async () => {
  let input;
  const controller = UserController({ createUser: async (data) => { input = data; return { _id: 'operator-1', name: data.name }; } });
  const body = { name: 'Alice', lastName: 'Example', email: 'alice@example.com', password: 'Example-password-42' };
  const res = response();
  await controller.register({ body }, res);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(input, body);
  assert.equal(res.body._id, 'operator-1');
});

test('duplicate account errors return a conflict without exposing the database error', async () => {
  const controller = UserController({ createUser: async () => { throw Object.assign(new Error('private database details'), { code: 11000 }); } });
  const res = response();
  await controller.register({ body: {} }, res);
  assert.equal(res.statusCode, 409);
  assert.equal(JSON.stringify(res.body).includes('private'), false);
});
