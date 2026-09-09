import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import MessageRouter from '../routes/message/routes.js';
import messagePayload from './mocks/message.json' with { type: 'json' };
import user from './mocks/user.json' with { type: 'json' };

test('POST /message creates a message and stores recipient links for the authenticated user', async () => {
  const savedMessages = [];
  const savedReceptors = [];

  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.session = { userId: user._id };
    next();
  });

  app.use('/message', MessageRouter({
    entityId: 'Message',
    permissionModel: {
      getOne: async ({ entity, name }) => ({ _id: `${entity}-${name}`, entity, name }),
    },
    userPermissionModel: {
      getOne: async () => ({ _id: 'assignment-1' }),
    },
    actions: {
      getAll: 'getAll',
      getById: 'getById',
      post: 'register',
    },
    model: {
      save: async (data) => {
        savedMessages.push(data);
        return {
          ...data,
          _id: '665f1a2b3c4d5e6f70819501',
          toJSON: () => ({ ...data, _id: '665f1a2b3c4d5e6f70819501' }),
        };
      },
    },
    receptorModel: {
      save: async (data) => {
        savedReceptors.push(data);
        return { _id: '665f1a2b3c4d5e6f70819511', ...data };
      },
    },
  }));

  const server = app.listen(0);

  try {
    const { port } = await new Promise((resolve) => server.once('listening', () => resolve(server.address())));
    const response = await fetch(`http://127.0.0.1:${port}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messagePayload),
    });

    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(savedMessages[0].sender, user._id);
    assert.equal(savedMessages[0].content, messagePayload.content);
    assert.deepEqual(savedReceptors.map((entry) => entry.contact), messagePayload.contacts);
    assert.equal(body.sender, user._id);
    assert.deepEqual(body.receptors.map((entry) => entry.contact), messagePayload.contacts);
  } finally {
    server.close();
  }
});
