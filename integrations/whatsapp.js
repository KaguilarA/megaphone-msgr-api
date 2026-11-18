const REQUEST_TIMEOUT_MS = 15_000;
const SESSION_PATTERN = /^[a-zA-Z0-9._-]{1,64}$/;

function providerError(response, body) {
  const providerMessage =
    typeof body?.message === "string"
      ? body.message
      : typeof body?.error === "string"
        ? body.error
        : body?.error?.message;
  return Object.assign(
    new Error(
      providerMessage
        ? `WAHA rejected the request: ${providerMessage}`
        : `WAHA request failed (HTTP ${response.status}).`,
    ),
    {
      providerRejected: response.status >= 400 && response.status < 500,
      status: response.status >= 500 ? 503 : 422,
    },
  );
}

async function readJson(response, description) {
  try {
    return await response.json();
  } catch (error) {
    if (!response.ok) throw providerError(response);
    throw new Error(`WAHA returned an invalid ${description} response.`, {
      cause: error,
    });
  }
}

function messageId(body) {
  const id = body?.id;
  if (typeof id === "string") return id;
  if (typeof id?._serialized === "string") return id._serialized;
  if (typeof body?._data?.id?._serialized === "string") {
    return body._data.id._serialized;
  }
  return undefined;
}

function getTransport(apiBaseUrl, apiKey) {
  if (typeof apiKey !== "string" || !apiKey.trim()) {
    throw new Error("WAHA_API_KEY is required.");
  }
  const apiUrl = new URL(apiBaseUrl);
  if (!["http:", "https:"].includes(apiUrl.protocol) ||
      apiUrl.username || apiUrl.password || apiUrl.search || apiUrl.hash) {
    throw new Error("WAHA_API_URL must be an HTTP(S) URL without embedded credentials.");
  }
  return {
    apiRoot: apiUrl.toString().replace(/\/$/, ""),
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
  };
}

export async function verifyWhatsAppSession(
  tokenData,
  sourcePhoneNumber,
  { apiBaseUrl, apiKey, fetchImpl = fetch } = {},
) {
  if (!tokenData || typeof tokenData.whatsappSession !== "string" ||
      !SESSION_PATTERN.test(tokenData.whatsappSession)) {
    throw new Error("A phone record with a valid whatsappSession is required.");
  }
  if (typeof sourcePhoneNumber !== "string" ||
      !/^\+?[1-9]\d{7,14}$/.test(sourcePhoneNumber)) {
    throw new Error("A valid sourcePhoneNumber is required to verify the WAHA session.");
  }
  const { apiRoot, headers } = getTransport(apiBaseUrl, apiKey);
  const sessionUrl = `${apiRoot}/api/sessions/${encodeURIComponent(tokenData.whatsappSession)}/me`;
  const response = await fetchImpl(sessionUrl, {
    method: "GET",
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const session = await readJson(response, "session");
  if (!response.ok) throw providerError(response, session);

  const connectedNumber = typeof session?.id === "string"
    ? session.id.split("@")[0].replace(/^\+/, "")
    : "";
  if (
    !connectedNumber ||
    connectedNumber !== sourcePhoneNumber.replace(/^\+/, "")
  ) {
    throw Object.assign(
      new Error("The WAHA session is not connected to the selected source phone."),
      { providerRejected: true, status: 422 },
    );
  }
}

/**
 * Send a WhatsApp message through a phone-owned WAHA session.
 *
 * @param {string} recipient E.164 phone number, with or without a leading plus.
 * @param {string} message Message text.
 * @param {{ whatsappSession: string }} tokenData Phone-bound session record.
 * @param {{
 *   apiBaseUrl: string,
 *   apiKey: string,
 *   sourcePhoneNumber: string,
 *   sessionVerified?: boolean,
 *   media?: { type: "image" | "video", url: string, mimeType?: string },
 *   fetchImpl?: typeof fetch
 * }} options WAHA transport settings and verified source number.
 * @returns {Promise<object>} WAHA's accepted message response.
 */
export async function sendWhatsAppMessage(
  recipient,
  message,
  tokenData,
  {
    apiBaseUrl,
    apiKey,
    sourcePhoneNumber,
    sessionVerified = false,
    media,
    fetchImpl = fetch,
  } = {},
) {
  if (typeof recipient !== "string" || !/^\+?[1-9]\d{7,14}$/.test(recipient)) {
    throw new TypeError("recipient must be a valid E.164 phone number.");
  }
  if (typeof message !== "string" || !message.trim()) {
    throw new TypeError("message must be a non-empty string.");
  }
  if (!tokenData || typeof tokenData.whatsappSession !== "string" ||
      !SESSION_PATTERN.test(tokenData.whatsappSession)) {
    throw new Error("A phone record with a valid whatsappSession is required.");
  }
  if (typeof sourcePhoneNumber !== "string" ||
      !/^\+?[1-9]\d{7,14}$/.test(sourcePhoneNumber)) {
    throw new Error("A valid sourcePhoneNumber is required to verify the WAHA session.");
  }
  const { apiRoot, headers } = getTransport(apiBaseUrl, apiKey);
  if (!sessionVerified) {
    await verifyWhatsAppSession(tokenData, sourcePhoneNumber, {
      apiBaseUrl,
      apiKey,
      fetchImpl,
    });
  }

  const chatId = `${recipient.replace(/^\+/, "")}@c.us`;
  const endpoint = media
    ? media.type === "image" ? "sendImage" : "sendVideo"
    : "sendText";
  if (media && !["image", "video"].includes(media.type)) {
    throw new TypeError("media.type must be image or video.");
  }
  const payload = {
    session: tokenData.whatsappSession,
    chatId,
    ...(media
      ? {
          file: {
            url: media.url,
            ...(media.mimeType ? { mimetype: media.mimeType } : {}),
          },
          caption: message,
        }
      : { text: message }),
  };
  const response = await fetchImpl(`${apiRoot}/api/${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const responseBody = await readJson(response, "message");
  if (!response.ok) throw providerError(response, responseBody);
  if (!messageId(responseBody)) {
    throw new Error("WAHA did not confirm acceptance with a message ID.");
  }
  return {
    ...responseBody,
    messages: [{ id: messageId(responseBody) }],
  };
}
