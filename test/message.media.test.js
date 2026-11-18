import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import MessageRouter from '../routes/message/routes.js';

async function withServer(run, { processor = async (file) => ({
  type: file.mimetype.startsWith('image/') ? 'image' : 'video',
  data: file.buffer.toString('base64'),
  filename: 'attachment',
  mimeType: file.mimetype,
  bytes: file.buffer.length,
}) } = {}) {
  const saved = [];
  const sent = [];
  const app = express();
  app.use((req, _res, next) => { req.session = { userId: 'owner' }; next(); });
  app.use('/message', MessageRouter({
    id: 'Message', actions: { post: 'register' },
    permissionModel: { getOne: async () => ({ _id: 'permission' }) },
    userPermissionModel: { getOne: async () => ({ _id: 'assignment' }) },
    actionLogModel: { save: async () => {} },
    model: {
      getOne: async () => null,
      save: async (data) => { saved.push(data); return { _id: 'message', toJSON: () => data }; },
      update: async () => {},
    },
    receptorModel: { save: async (data) => data },
    phoneModel: {
      getById: async () => ({ _id: 'phone', owner: 'owner', ownerType: 'User', phone: '5550002', countryNumber: '+52' }),
      getByCoincidence: async () => [{ countryNumber: '+52', phone: '5550001' }],
    },
    tokenModel: { getOne: async () => ({ owner: 'owner', phone: 'phone', whatsappSession: 'phone-session' }) },
    contactModel: { getById: async () => ({ owner: 'owner' }) },
    mediaProcessor: processor,
    sendWhatsAppMessage: async (...args) => { sent.push(args); return { messages: [{ id: 'wamid' }] }; },
  }));
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}/message`, { saved, sent }); }
  finally { server.close(); }
}

function form(type, bytes = 4, content = 'Hola') {
  const body = new FormData();
  body.set('header', 'Aviso');
  body.set('content', content);
  body.set('contacts', JSON.stringify(['contact']));
  body.set('sourcePhoneId', 'phone');
  body.set('requestId', 'd06b1e8b-93df-44c0-b3f8-8b3a40d7aad5');
  body.set('media', new Blob([new Uint8Array(bytes)], { type }), 'file');
  return body;
}

test('image and video attachments reach the provider and message history', async () => {
  await withServer(async (url, { saved, sent }) => {
    for (const [mime, type] of [['image/png', 'image'], ['video/mp4', 'video']]) {
      const response = await fetch(url, { method: 'POST', body: form(mime) });
      assert.equal(response.status, 201);
      assert.equal((await response.json()).channel, 'whatsapp');
      assert.equal(saved.at(-1).channel, 'whatsapp');
      assert.equal(Object.hasOwn(saved.at(-1), 'media'), false);
      assert.equal(sent.at(-1)[3].media.type, type);
      assert.ok(sent.at(-1)[3].media.data);
    }
  });
});

test('allows an attachment-only message without a subject or caption', async () => {
  await withServer(async (url, { saved, sent }) => {
    const body = form('image/png', 4, '');
    body.delete('header');
    body.delete('content');

    const response = await fetch(url, { method: 'POST', body });

    assert.equal(response.status, 201);
    assert.equal(saved[0].header, '');
    assert.equal(saved[0].content, '');
    assert.equal(sent[0][1], '');
  });
});

test('requires text when no attachment is included', async () => {
  await withServer(async (url, { saved, sent }) => {
    const body = form('image/png', 4, '');
    body.delete('media');

    const response = await fetch(url, { method: 'POST', body });

    assert.equal(response.status, 400);
    assert.equal(saved.length, 0);
    assert.equal(sent.length, 0);
  });
});

test('invalid attachment types, sizes, counts and captions are rejected before sending', async () => {
  await withServer(async (url, { saved, sent }) => {
    const cases = [
      [form('application/pdf'), 400],
      [form('image/gif'), 400],
      [form('image/png', 5 * 1024 * 1024 + 1), 413],
      [form('video/mp4', 16 * 1024 * 1024 + 1), 413],
      [form('image/png', 4, 'x'.repeat(1025)), 400],
    ];
    const multiple = form('image/png');
    multiple.append('media', new Blob(['video'], { type: 'video/mp4' }), 'video.mp4');
    cases.push([multiple, 400]);
    for (const [body, status] of cases) {
      const response = await fetch(url, { method: 'POST', body });
      assert.equal(response.status, status);
      assert.ok((await response.json()).message || status === 400);
    }
    assert.equal(saved.length, 0);
    assert.equal(sent.length, 0);
    assert.equal((await fetch(url, { method: 'POST', body: form('image/png', 4, 'x'.repeat(1024)) })).status, 201);
  });
});

test('a missing media processor never silently sends a text-only message', async () => {
  await withServer(async (url, { saved, sent }) => {
    const response = await fetch(url, { method: 'POST', body: form('image/png') });
    assert.equal(response.status, 503);
    assert.equal(saved.length, 0);
    assert.equal(sent.length, 0);
  }, { processor: null });
});
