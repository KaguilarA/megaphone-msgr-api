import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import MessageRouter from '../routes/message/routes.js';

async function withServer(run, {
  processor = async (file) => ({
    type: file.mimetype.startsWith('image/') ? 'image' : 'video',
    data: file.buffer.toString('base64'),
    filename: file.originalname,
    mimeType: file.mimetype,
    bytes: file.buffer.length,
    ...(file.mimetype.startsWith('image/') ? { mediaUrl: 'https://res.cloudinary.com/example/image.png' } : {}),
  }),
  sourcePhones = [{
    _id: 'phone',
    owner: 'owner',
    ownerType: 'User',
    phone: '5550002',
    countryNumber: '+52',
  }],
  sendMessage = async () => ({ messages: [{ id: 'wamid' }] }),
} = {}) {
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
      getById: async (id) => sourcePhones.find((phone) => phone._id === id),
      getByCoincidence: async ({ owner }) => [{
        countryNumber: '+52',
        phone: owner === 'contact-2' ? '5550003' : '5550001',
      }],
    },
    tokenModel: {
      getOne: async ({ phone }) => ({
        owner: 'owner',
        phone,
        whatsappSession: `session-${phone}`,
      }),
    },
    contactModel: { getById: async () => ({ owner: 'owner' }) },
    mediaProcessor: processor,
    sendWhatsAppMessage: async (...args) => {
      sent.push(args);
      return sendMessage(...args);
    },
  }));
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}/message`, { saved, sent }); }
  finally { server.close(); }
}

function form(type, bytes = 4, content = 'Hola', contacts = ['contact']) {
  const body = new FormData();
  body.set('header', 'Aviso');
  body.set('content', content);
  body.set('contacts', JSON.stringify(contacts));
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
      assert.deepEqual(saved.at(-1).contacts, ['contact']);
      assert.equal(
        saved.at(-1).mediaUrl,
        type === 'image' ? 'https://res.cloudinary.com/example/image.png' : undefined,
      );
      assert.equal(sent.at(-1)[3].media.type, type);
      assert.ok(sent.at(-1)[3].media.data);
    }
  });
});

test('stores one group message, one image reference, and all contact IDs for a bulk send', async () => {
  let mediaProcessingCount = 0;
  const processor = async (file) => {
    mediaProcessingCount += 1;
    return {
      type: 'image',
      data: file.buffer.toString('base64'),
      filename: 'attachment.png',
      mimeType: file.mimetype,
      bytes: file.buffer.length,
      mediaUrl: 'https://res.cloudinary.com/example/image.png',
    };
  };
  await withServer(async (url, { saved, sent }) => {
    const contactIds = ['contact-1', 'contact-2'];
    const response = await fetch(url, {
      method: 'POST',
      body: form('image/png', 4, 'Hola', contactIds),
    });

    assert.equal(response.status, 201);
    assert.equal(saved.length, 1);
    assert.deepEqual(saved[0].contacts, contactIds);
    assert.equal(saved[0].mediaUrl, 'https://res.cloudinary.com/example/image.png');
    assert.equal(mediaProcessingCount, 1);
    assert.equal(sent.length, contactIds.length);
  }, { processor });
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
    const multipleVideos = form('video/mp4');
    multipleVideos.append('media', new Blob(['video'], { type: 'video/mp4' }), 'video-2.mp4');
    cases.push([multipleVideos, 400]);
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

test('sends each image from its own selected number in parallel and sends the video from the first', async () => {
  const sourcePhones = ['phone-1', 'phone-2', 'phone-3'].map((id, index) => ({
    _id: id,
    owner: 'owner',
    ownerType: 'User',
    phone: `555000${index + 1}`,
    countryNumber: '+52',
  }));
  let activeSends = 0;
  let maximumConcurrentSends = 0;
  const processor = async (file) => ({
    type: file.mimetype.startsWith('image/') ? 'image' : 'video',
    data: file.buffer.toString('base64'),
    filename: file.originalname,
    mimeType: file.mimetype,
    bytes: file.buffer.length,
    ...(file.mimetype.startsWith('image/')
      ? { mediaUrl: `https://res.cloudinary.com/example/${file.originalname}` }
      : {}),
  });
  const sendMessage = async (...args) => {
    activeSends++;
    maximumConcurrentSends = Math.max(maximumConcurrentSends, activeSends);
    await new Promise((resolve) => setTimeout(resolve, 5));
    activeSends--;
    return { messages: [{ id: `wamid-${args[3].media.filename}` }] };
  };

  await withServer(async (url, { saved, sent }) => {
    const body = new FormData();
    body.set('content', 'Hola');
    body.set('contacts', JSON.stringify(['contact-1', 'contact-2']));
    body.set('senderMode', 'per-media');
    body.set('sourcePhoneIds', JSON.stringify(sourcePhones.map((phone) => phone._id)));
    body.set('requestId', 'd06b1e8b-93df-44c0-b3f8-8b3a40d7aad5');
    for (const [name, type] of [
      ['one.png', 'image/png'],
      ['two.png', 'image/png'],
      ['three.png', 'image/png'],
      ['clip.mp4', 'video/mp4'],
    ]) {
      body.append('media', new Blob([name], { type }), name);
    }

    const response = await fetch(url, { method: 'POST', body });
    const result = await response.json();

    assert.equal(response.status, 201);
    assert.equal(result.deliveryStatus, 'accepted');
    assert.equal(saved[0].mediaAttachments.length, 4);
    assert.equal(saved[0].mediaUrl, 'https://res.cloudinary.com/example/one.png');
    assert.equal(sent.length, 8);
    assert.equal(maximumConcurrentSends, 4);
    for (const recipientDelivery of result.deliveries) {
      assert.deepEqual(
        recipientDelivery.mediaResults.map((item) => item.senderPhone),
        ['phone-1', 'phone-2', 'phone-3', 'phone-1'],
      );
      assert.ok(recipientDelivery.mediaResults.every((item) => item.status === 'accepted'));
    }
    const firstRecipientSends = sent.filter((args) => args[0] === '+525550001');
    assert.deepEqual(
      firstRecipientSends.map((args) => args[2].whatsappSession),
      ['session-phone-1', 'session-phone-2', 'session-phone-3', 'session-phone-1'],
    );
    assert.deepEqual(firstRecipientSends.map((args) => args[1]), ['Hola', '', '', '']);
  }, { processor, sourcePhones, sendMessage });
});

test('records partial outcomes when only some images are accepted', async () => {
  const sourcePhones = ['phone-1', 'phone-2'].map((id, index) => ({
    _id: id,
    owner: 'owner',
    ownerType: 'User',
    phone: `555000${index + 1}`,
    countryNumber: '+52',
  }));
  const sendMessage = async (...args) => {
    if (args[3].media.filename === 'two.png') {
      throw Object.assign(new Error('Rejected'), { providerRejected: true });
    }
    return { messages: [{ id: 'wamid-one' }] };
  };

  await withServer(async (url, { saved }) => {
    const body = new FormData();
    body.set('content', 'Hola');
    body.set('contacts', JSON.stringify(['contact-1']));
    body.set('senderMode', 'per-media');
    body.set('sourcePhoneIds', JSON.stringify(sourcePhones.map((phone) => phone._id)));
    body.set('requestId', 'd06b1e8b-93df-44c0-b3f8-8b3a40d7aad5');
    body.append('media', new Blob(['one'], { type: 'image/png' }), 'one.png');
    body.append('media', new Blob(['two'], { type: 'image/png' }), 'two.png');

    const response = await fetch(url, { method: 'POST', body });
    const result = await response.json();

    assert.equal(response.status, 201);
    assert.equal(result.deliveryStatus, 'partial');
    assert.equal(result.deliveries[0].status, 'partial');
    assert.deepEqual(
      result.deliveries[0].mediaResults.map((item) => item.status),
      ['accepted', 'rejected'],
    );
    assert.deepEqual(saved[0].deliveries, result.deliveries);
  }, { sourcePhones, sendMessage });
});

test('rejects image batches without one distinct sender per image before sending', async () => {
  const sourcePhones = ['phone-1', 'phone-2'].map((id, index) => ({
    _id: id,
    owner: 'owner',
    ownerType: 'User',
    phone: `555000${index + 1}`,
    countryNumber: '+52',
  }));
  await withServer(async (url, { saved, sent }) => {
    const body = form('image/png');
    body.delete('sourcePhoneId');
    body.set('senderMode', 'per-media');
    body.set('sourcePhoneIds', JSON.stringify(sourcePhones.map((phone) => phone._id)));
    body.append('media', new Blob(['two'], { type: 'image/png' }), 'two.png');
    body.append('media', new Blob(['three'], { type: 'image/png' }), 'three.png');

    const response = await fetch(url, { method: 'POST', body });

    assert.equal(response.status, 400);
    assert.equal(saved.length, 0);
    assert.equal(sent.length, 0);
  }, { sourcePhones });
});

test('rejects more than ten images at the upload boundary', async () => {
  await withServer(async (url, { saved, sent }) => {
    const body = form('image/png');
    for (let index = 1; index < 11; index++) {
      body.append('media', new Blob(['image'], { type: 'image/png' }), `image-${index}.png`);
    }

    const response = await fetch(url, { method: 'POST', body });

    assert.equal(response.status, 400);
    assert.equal(saved.length, 0);
    assert.equal(sent.length, 0);
  });
});
