import test from 'node:test';
import assert from 'node:assert/strict';
import MessageController from '../controllers/message/controller.js';

test('delete removes receptor rows and the message itself', async () => {
  const cleared = [];
  const deleted = [];

  const controller = MessageController({
    id: 'Message',
    model: {
      delete: async (messageId) => {
        deleted.push(messageId);
        return { _id: messageId };
      },
    },
    receptorModel: {
      getByCoincidence: async (filter) => {
        cleared.push(filter);
        return [{ _id: 'r-1', message: filter.message }];
      },
      delete: async (receptorId) => {
        deleted.push(receptorId);
        return { _id: receptorId };
      },
    },
  });

  const req = { params: { id: '665f1a2b3c4d5e6f70819504' } };
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  await controller.delete(req, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.ended, true);
  assert.deepEqual(cleared, [{ message: '665f1a2b3c4d5e6f70819504' }]);
  assert.deepEqual(deleted.includes('665f1a2b3c4d5e6f70819504'), true);
});

test('getById returns the message and its receptors', async () => {
  const controller = MessageController({
    id: 'Message',
    model: {
      getById: async () => ({
        toJSON: () => ({ _id: '665f1a2b3c4d5e6f70819505', content: 'Confirmacion recibida' }),
      }),
    },
    receptorModel: {
      getByCoincidence: async () => [{ _id: '665f1a2b3c4d5e6f70819515', contact: '665f1a2b3c4d5e6f708192c1' }],
    },
    populatedFields: ['sender'],
  });

  const req = { params: { id: '665f1a2b3c4d5e6f70819505' } };
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  await controller.getById(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    _id: '665f1a2b3c4d5e6f70819505',
    content: 'Confirmacion recibida',
    receptors: [{ _id: '665f1a2b3c4d5e6f70819515', contact: '665f1a2b3c4d5e6f708192c1' }],
  });
});
