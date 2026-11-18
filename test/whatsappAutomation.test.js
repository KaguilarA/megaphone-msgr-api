import test from "node:test";
import assert from "node:assert/strict";
import WhatsAppAutomationController from "../controllers/whatsappAutomation/controller.js";

const owner = "owner-1";
const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test("reads only the signed-in user's automation and recent messages", async () => {
  const filters = [];
  const controller = WhatsAppAutomationController({
    automationModel: {
      getOne: async (filter) => {
        filters.push(filter);
        return { enabled: true, rules: [{ keyword: "hola", response: "Hola" }] };
      },
    },
    conversationMessageModel: {
      getLatest: async (filter, limit) => {
        filters.push(filter);
        assert.equal(limit, 100);
        return [{ text: "Mensaje" }];
      },
    },
  });
  const res = response();
  await controller.get({ session: { userId: owner } }, res);

  assert.deepEqual(filters, [{ owner }, { owner }]);
  assert.equal(res.body.enabled, true);
  assert.equal(res.body.rules[0].keyword, "hola");
  assert.deepEqual(res.body.recentMessages, [{ text: "Mensaje" }]);
});

test("saves deterministic rules under the authenticated owner", async () => {
  let saved;
  const controller = WhatsAppAutomationController({
    automationModel: {
      getOne: async (filter) => {
        assert.deepEqual(filter, { owner });
        return null;
      },
      save: async (data) => (saved = data),
    },
  });
  const res = response();
  await controller.update({
    session: { userId: owner },
    body: {
      enabled: true,
      rules: [{
        keyword: " precio ",
        response: "Hola {{contact.phone}}",
        enabled: true,
      }],
    },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(saved.owner, owner);
  assert.equal(saved.enabled, true);
  assert.deepEqual(saved.rules, [{
    keyword: "precio",
    response: "Hola {{contact.phone}}",
    enabled: true,
  }]);
});

test("rejects duplicate keywords, invalid response fields and malformed rules", async () => {
  const controller = WhatsAppAutomationController({ automationModel: { getOne: async () => null } });
  for (const [rules, expected] of [
    [[{ keyword: "Hola", response: "Uno" }, { keyword: " hola ", response: "Dos" }], /keywords must be unique/],
    [[{ keyword: "Hola", response: "Hola {{contact.email}}" }], /Unknown response template fields/],
    [[{ keyword: "Hola", response: "" }], /response template/],
  ]) {
    const res = response();
    await controller.update({
      session: { userId: owner },
      body: { enabled: true, rules },
    }, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, expected);
  }
});
