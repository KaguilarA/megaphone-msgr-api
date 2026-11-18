import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import express from "express";
import WahaWebhook, {
  hasValidSignature,
  normalizeDirectPhone,
} from "../routes/webhooks/waha.js";

const secret = "a".repeat(64);
const owner = "owner-1";
const sourcePhone = {
  _id: "source-phone",
  owner,
  ownerType: "User",
  phone: "4155550100",
  countryNumber: "+1",
};

function signedRequest(body, hmacKey = secret) {
  const rawBody = Buffer.from(JSON.stringify(body));
  const signature = createHmac("sha512", hmacKey).update(rawBody).digest("hex");
  return { rawBody, signature };
}

async function postWebhook(router, rawBody, signature) {
  const app = express();
  app.use(express.raw({ type: "application/json" }));
  app.use("/webhooks/waha", router);
  const server = app.listen(0);
  try {
    const { port } = await new Promise((resolve) => server.once("listening", () => resolve(server.address())));
    return await fetch(`http://127.0.0.1:${port}/webhooks/waha`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Hmac": signature,
        "X-Webhook-Hmac-Algorithm": "sha512",
      },
      body: rawBody,
    });
  } finally {
    server.close();
  }
}

function webhookDependencies(overrides = {}) {
  const saved = [];
  const updates = [];
  const sent = [];
  const knownIds = new Set();
  const dependencies = {
    hmacKey: secret,
    tokenModel: {
      getOne: async (filter) => {
        assert.deepEqual(filter, { whatsappSession: "session-1" });
        return { owner, phone: sourcePhone._id, whatsappSession: "session-1" };
      },
    },
    phoneModel: {
      getById: async () => sourcePhone,
      getByCoincidence: async (filter) => {
        assert.deepEqual(filter, { ownerType: "Contact", e164: "+14155551234" });
        return [{ _id: "contact-phone", owner: "contact-1", phone: "4155551234", countryNumber: "+1", e164: "+14155551234" }];
      },
    },
    contactModel: {
      getById: async () => ({ _id: "contact-1", owner, name: "Alex" }),
    },
    messageModel: {
      getLatestForRecipient: async () => [{
        content: "A previous campaign reply",
        createdAt: new Date("2025-01-01T00:00:00Z"),
      }],
    },
    conversationMessageModel: {
      getOne: async ({ providerMessageId }) =>
        knownIds.has(providerMessageId) ? { _id: "existing" } : null,
      getLatest: async () => [{
        direction: "inbound",
        text: "Earlier inbound",
        createdAt: new Date("2025-01-02T00:00:00Z"),
      }],
      save: async (data) => {
        saved.push(data);
        if (data.direction === "inbound") knownIds.add(data.providerMessageId);
        return { _id: `message-${saved.length}`, ...data };
      },
      update: async (id, data) => updates.push({ id, data }),
    },
    automationModel: {
      getOne: async () => ({
        enabled: true,
        rules: [{
          keyword: "precio",
          response: "Hola {{contact.name}}. Último envío: {{history.lastReply}}. Antes: {{history.lastInbound}}.",
        }],
      }),
    },
    permissionModel: {
      getOne: async () => ({ _id: "message-register" }),
    },
    userPermissionModel: {
      getOne: async () => ({ _id: "assignment" }),
    },
    whatsappConfig: { apiBaseUrl: "https://waha.example", apiKey: "server-key" },
    verifyWhatsAppSession: async () => {},
    sendWhatsAppMessage: async (recipient, text, token, config) => {
      sent.push({ recipient, text, token, config });
      return { messages: [{ id: "provider-out-1" }] };
    },
  };
  Object.assign(dependencies, overrides);
  return { dependencies, saved, updates, sent };
}

test("validates SHA-512 webhook signatures and rejects unsupported algorithms", () => {
  const rawBody = Buffer.from('{"event":"message"}');
  const signature = createHmac("sha512", secret).update(rawBody).digest("hex");
  assert.equal(hasValidSignature(rawBody, signature, "sha512", secret), true);
  assert.equal(hasValidSignature(rawBody, signature, "sha256", secret), false);
  assert.equal(hasValidSignature(rawBody, signature, "sha512", `${secret}x`), false);
});

test("only accepts direct numeric WhatsApp addresses", () => {
  assert.equal(normalizeDirectPhone("14155551234@c.us"), "+14155551234");
  assert.equal(normalizeDirectPhone("14155551234@s.whatsapp.net"), "+14155551234");
  assert.equal(normalizeDirectPhone("120363000000000000@g.us"), undefined);
  assert.equal(normalizeDirectPhone("contact@lid"), undefined);
});

test("stores an incoming message, uses campaign history and replies through its WAHA session", async () => {
  const { dependencies, saved, updates, sent } = webhookDependencies();
  const router = WahaWebhook(dependencies);
  const body = {
    event: "message",
    session: "session-1",
    payload: {
      id: { _serialized: "provider-in-1" },
      from: "14155551234@c.us",
      fromMe: false,
      body: "¿Cuál es el precio?",
      hasMedia: true,
    },
  };
  const { rawBody, signature } = signedRequest(body);
  const response = await postWebhook(router, rawBody, signature);

  assert.equal(response.status, 200);
  assert.equal(saved[0].direction, "inbound");
  assert.equal(saved[0].contact, "contact-1");
  assert.deepEqual(saved[0].providerMessageId, "provider-in-1");
  assert.equal(Object.hasOwn(saved[0], "hasMedia"), false);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].recipient, "+14155551234");
  assert.equal(
    sent[0].text,
    "Hola Alex. Último envío: A previous campaign reply. Antes: Earlier inbound.",
  );
  assert.equal(sent[0].token.whatsappSession, "session-1");
  assert.equal(sent[0].config.sessionVerified, true);
  assert.ok(updates.some(({ data }) => data.autoReplyStatus === "accepted"));
  assert.equal(saved[1].direction, "outbound");
  assert.equal(saved[1].replyToMessage, "message-1");
});

test("rejects invalid signatures and ignores group messages without touching storage", async () => {
  let tokenLookups = 0;
  const { dependencies } = webhookDependencies({
    tokenModel: { getOne: async () => { tokenLookups += 1; } },
  });
  const router = WahaWebhook(dependencies);
  const invalid = signedRequest({ event: "message" }, "wrong-secret");
  const unauthorized = await postWebhook(router, invalid.rawBody, invalid.signature);
  assert.equal(unauthorized.status, 401);

  const group = {
    event: "message",
    session: "session-1",
    payload: { id: "group-message", from: "120363000000000000@g.us", body: "hola" },
  };
  const signedGroup = signedRequest(group);
  const accepted = await postWebhook(router, signedGroup.rawBody, signedGroup.signature);
  assert.equal(accepted.status, 200);
  assert.equal(tokenLookups, 0);
});

test("does not send an automatic reply twice for a duplicate provider message", async () => {
  const { dependencies, sent } = webhookDependencies();
  const router = WahaWebhook(dependencies);
  const body = {
    event: "message",
    session: "session-1",
    payload: {
      id: "provider-in-1",
      from: "14155551234@c.us",
      body: "precio",
    },
  };
  const { rawBody, signature } = signedRequest(body);
  assert.equal((await postWebhook(router, rawBody, signature)).status, 200);
  assert.equal((await postWebhook(router, rawBody, signature)).status, 200);
  assert.equal(sent.length, 1);
});
