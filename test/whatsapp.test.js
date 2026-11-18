import test from "node:test";
import assert from "node:assert/strict";
import {
  sendWhatsAppMessage,
  verifyWhatsAppSession,
} from "../integrations/whatsapp.js";

const sessionRecord = { whatsappSession: "my-number" };
const options = {
  apiBaseUrl: "http://waha.example.test:3000",
  apiKey: "test-api-key",
  sourcePhoneNumber: "+14155552670",
};

function fetchFor({ session = { id: "14155552670@c.us" }, message = { id: "wamid.test" } } = {}) {
  return async (url, request) => ({
    ok: true,
    status: 200,
    json: async () => url.endsWith("/me") ? session : message,
  });
}

test("verifies the source session and sends text through WAHA", async () => {
  const requests = [];
  const result = await sendWhatsAppMessage(
    "+14155552671",
    "Hello!",
    sessionRecord,
    {
      ...options,
      fetchImpl: async (url, request) => {
        requests.push({ url, request });
        return {
          ok: true,
          status: 200,
          json: async () => url.endsWith("/me")
            ? { id: "14155552670@c.us" }
            : { id: "wamid.test" },
        };
      },
    },
  );

  assert.equal(requests[0].url, "http://waha.example.test:3000/api/sessions/my-number/me");
  assert.equal(requests[0].request.method, "GET");
  assert.equal(requests[1].url, "http://waha.example.test:3000/api/sendText");
  assert.equal(requests[1].request.method, "POST");
  assert.equal(requests[1].request.headers["X-Api-Key"], options.apiKey);
  assert.deepEqual(JSON.parse(requests[1].request.body), {
    session: "my-number",
    chatId: "14155552671@c.us",
    text: "Hello!",
  });
  assert.equal(result.messages[0].id, "wamid.test");
});

test("rejects invalid input and missing WAHA configuration before requesting", async () => {
  const fetchImpl = async () => assert.fail("WAHA must not be called");
  const config = { ...options, fetchImpl };
  await assert.rejects(
    sendWhatsAppMessage("not-a-phone", "Hello!", sessionRecord, config),
    /valid E\.164/,
  );
  await assert.rejects(
    sendWhatsAppMessage("+14155552671", " ", sessionRecord, config),
    /non-empty string/,
  );
  await assert.rejects(
    sendWhatsAppMessage("+14155552671", "Hello!", null, config),
    /valid whatsappSession/,
  );
  await assert.rejects(
    sendWhatsAppMessage("+14155552671", "Hello!", sessionRecord, {
      ...config,
      apiKey: "",
    }),
    /WAHA_API_KEY is required/,
  );
});

test("does not send from a session connected to a different source phone", async () => {
  let sendCalled = false;
  await assert.rejects(
    sendWhatsAppMessage("+14155552671", "Hello!", sessionRecord, {
      ...options,
      fetchImpl: async (url) => {
        if (url.endsWith("/me")) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: "14155550000@c.us" }),
          };
        }
        sendCalled = true;
        return { ok: true, status: 200, json: async () => ({ id: "wamid.test" }) };
      },
    }),
    /not connected to the selected source phone/,
  );
  assert.equal(sendCalled, false);
});

test("validates a session once for a recipient batch", async () => {
  let requestCount = 0;
  const fetchImpl = async () => {
    requestCount++;
    return { ok: true, status: 200, json: async () => ({ id: "wamid.test" }) };
  };
  await verifyWhatsAppSession(sessionRecord, options.sourcePhoneNumber, {
    ...options,
    fetchImpl: async () => {
      requestCount++;
      return { ok: true, status: 200, json: async () => ({ id: "14155552670@c.us" }) };
    },
  });
  for (let index = 0; index < 3; index++) {
    await sendWhatsAppMessage("+14155552671", "Hello!", sessionRecord, {
      ...options,
      sessionVerified: true,
      fetchImpl,
    });
  }
  assert.equal(requestCount, 4);
});

test("rejects sessions that are already connected to another source", async () => {
  await assert.rejects(
    sendWhatsAppMessage("+14155552671", "Hello!", sessionRecord, {
      ...options,
      fetchImpl: async () => ({
        ok: false,
        status: 404,
        json: async () => ({ message: "Session not found" }),
      }),
    }),
    (error) => {
      assert.equal(error.providerRejected, true);
      assert.match(error.message, /Session not found/);
      assert.doesNotMatch(error.message, /test-api-key/);
      return true;
    },
  );
});

test("requires a message ID and treats server failures as uncertain", async () => {
  await assert.rejects(
    sendWhatsAppMessage("+14155552671", "Hello!", sessionRecord, {
      ...options,
      fetchImpl: fetchFor({ message: {} }),
    }),
    /did not confirm acceptance/,
  );
  await assert.rejects(
    sendWhatsAppMessage("+14155552671", "Hello!", sessionRecord, {
      ...options,
      fetchImpl: async (url) => url.endsWith("/me")
        ? { ok: true, status: 200, json: async () => ({ id: "14155552670@c.us" }) }
        : { ok: false, status: 503, json: async () => ({ message: "Unavailable" }) },
    }),
    (error) => error.providerRejected === false,
  );
});

test("sends image and video URL media with their caption", async () => {
  for (const type of ["image", "video"]) {
    let payload;
    const sent = await sendWhatsAppMessage(
      "+14155552671",
      "Hola",
      sessionRecord,
      {
        ...options,
        media: { type, url: "https://example.com/media", mimeType: `${type}/jpeg` },
        fetchImpl: async (url, request) => {
          if (url.endsWith("/me")) {
            return { ok: true, status: 200, json: async () => ({ id: "14155552670@c.us" }) };
          }
          payload = { url, body: JSON.parse(request.body) };
          return { ok: true, status: 200, json: async () => ({ id: "wamid.test" }) };
        },
      },
    );
    assert.equal(payload.url, `http://waha.example.test:3000/api/send${type === "image" ? "Image" : "Video"}`);
    assert.deepEqual(payload.body.file, {
      url: "https://example.com/media",
      mimetype: `${type}/jpeg`,
    });
    assert.equal(payload.body.caption, "Hola");
    assert.equal(sent.messages[0].id, "wamid.test");
  }
});

test("requires an HTTP(S) URL without embedded credentials or query values", async () => {
  await assert.rejects(
    sendWhatsAppMessage("+14155552671", "Hello!", sessionRecord, {
      ...options,
      apiBaseUrl: "https://user:pass@waha.example.test",
      fetchImpl: async () => assert.fail("WAHA must not be called"),
    }),
    /must be an HTTP\(S\) URL/,
  );
});
