import test from "node:test";
import assert from "node:assert/strict";
import { sendWhatsAppMessage } from "../integrations/whatsapp.js";

const tokenRecord = {
  whatsappToken: "test-access-token",
  whatsappPhoneNumberId: "123456789012345",
  whatsappVersion: "v25.0",
};

test("sends a plain-text WhatsApp message with a Token model record", async () => {
  let request;
  const result = await sendWhatsAppMessage(
    "+14155552671",
    "Hello!",
    tokenRecord,
    {
      fetchImpl: async (url, options) => {
        request = { url: url.toString(), options };
        return {
          ok: true,
          json: async () => ({ messages: [{ id: "wamid.test" }] }),
        };
      },
    },
  );

  assert.equal(
    request.url,
    "https://graph.facebook.com/v25.0/123456789012345/messages",
  );
  assert.equal(request.options.method, "POST");
  assert.equal(
    request.options.headers.Authorization,
    `Bearer ${tokenRecord.whatsappToken}`,
  );
  assert.deepEqual(JSON.parse(request.options.body), {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: "14155552671",
    type: "text",
    text: { preview_url: false, body: "Hello!" },
  });
  assert.deepEqual(result, { messages: [{ id: "wamid.test" }] });
});

test("rejects invalid input and missing Token model credentials", async () => {
  const options = { fetchImpl: async () => assert.fail() };

  await assert.rejects(
    sendWhatsAppMessage("not-a-phone", "Hello!", tokenRecord, options),
    /valid E\.164/,
  );
  await assert.rejects(
    sendWhatsAppMessage("+14155552671", "  ", tokenRecord, options),
    /non-empty string/,
  );
  await assert.rejects(
    sendWhatsAppMessage("+14155552671", "Hello!", null, options),
    /Token model record with whatsappToken/,
  );
  await assert.rejects(
    sendWhatsAppMessage(
      "+14155552671",
      "Hello!",
      { ...tokenRecord, whatsappPhoneNumberId: "" },
      options,
    ),
    /valid whatsappPhoneNumberId/,
  );
});

test("reports provider rejections without disclosing the WhatsApp token", async () => {
  await assert.rejects(
    sendWhatsAppMessage("+14155552671", "Hello!", tokenRecord, {
      fetchImpl: async () => ({
        ok: false,
        status: 400,
        json: async () => ({
          error: { message: "The recipient is not allowed." },
        }),
      }),
    }),
    (error) => {
      assert.match(error.message, /recipient is not allowed/);
      assert.doesNotMatch(error.message, /test-access-token/);
      return true;
    },
  );
});

test("requires HTTPS for the Meta API base URL", async () => {
  await assert.rejects(
    sendWhatsAppMessage("+14155552671", "Hello!", tokenRecord, {
      apiBaseUrl: "http://graph.facebook.com",
      fetchImpl: async () => assert.fail(),
    }),
    /must be an HTTPS URL/,
  );
});
