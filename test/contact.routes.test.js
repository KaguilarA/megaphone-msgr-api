import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import ContactRouter from '../routes/contact.js';

test('GET /contact returns only the contact documents', async () => {
  let childLookupCalled = false;
  const app = express();

  app.use((req, _res, next) => {
    req.session = { userId: 'user-1' };
    next();
  });
  app.use('/contact', ContactRouter({
    model: {
      getByCoincidence: async (query) => {
        assert.deepEqual(query, { owner: 'user-1' });
        return [{ _id: 'contact-1', name: 'Ada' }];
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
  assert.deepEqual(body, [{ _id: 'contact-1', name: 'Ada' }]);
  assert.equal(childLookupCalled, false);
});