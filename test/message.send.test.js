import test from 'node:test';
import assert from 'node:assert/strict';
import MessageController from '../controllers/message/controller.js';
import messagePayload from './mocks/message.json' with { type: 'json' };
import user from './mocks/user.json' with { type: 'json' };

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

test('register creates a message and receptor entries', async () => {
  const savedMessages = [];

  const controller = MessageController({
    entityId: 'Message',
    model: {
      save: async (data) => {
        savedMessages.push(data);
        return { ...data, _id: '665f1a2b3c4d5e6f70819502', toJSON: () => ({ ...data, _id: '665f1a2b3c4d5e6f70819502' }) };
      },
    },
    receptorModel: {
      save: async (data) => ({ _id: '665f1a2b3c4d5e6f70819512', ...data }),
    },
  });

  const req = {
    body: {
      ...messagePayload,
    },
    session: {
      userId: user._id,
    },
  };
  const res = createRes();

  await controller.register(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(savedMessages.length, 1);
  assert.equal(savedMessages[0].content, messagePayload.content);
  assert.equal(savedMessages[0].sender, user._id);
  assert.equal(res.body.content, messagePayload.content);
  assert.equal(res.body.sender, user._id);
});

test('getAll returns only the authenticated user messages', async () => {
  const controller = MessageController({
    entityId: 'Message',
    model: {
      getByCoincidence: async (filter) => [{ _id: '665f1a2b3c4d5e6f70819503', content: messagePayload.content, sender: filter.sender }],
    },
    receptorModel: {
      getByCoincidence: async () => [],
    },
    populatedFields: ['sender'],
  });

  const req = {
    session: { userId: user._id },
  };
  const res = createRes();

  await controller.getAll(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, [{ _id: '665f1a2b3c4d5e6f70819503', content: messagePayload.content, sender: user._id }]);
});
