const REQUEST_TIMEOUT_MS = 15_000;
const SESSION_PATTERN = /^[a-zA-Z0-9._-]{1,64}$/;

function providerError(response, operation) {
  return Object.assign(
    new Error(
      response.status >= 500
        ? "El servicio de WhatsApp no está disponible."
        : "No se pudo completar la solicitud de WhatsApp.",
    ),
    {
      providerRejected: response.status >= 400 && response.status < 500,
      providerStatus: response.status,
      providerOperation: operation,
      status: response.status >= 500 ? 503 : 422,
    },
  );
}

async function readJson(response, description) {
  try {
    return await response.json();
  } catch (error) {
    if (!response.ok) throw providerError(response, description);
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

function validateConnectionInput(tokenData, sourcePhoneNumber, options) {
  if (!tokenData || typeof tokenData.whatsappSession !== "string" ||
      !SESSION_PATTERN.test(tokenData.whatsappSession)) {
    throw new Error("A phone record with a valid whatsappSession is required.");
  }
  if (typeof sourcePhoneNumber !== "string" ||
      !/^\+?[1-9]\d{7,14}$/.test(sourcePhoneNumber)) {
    throw new Error("A valid sourcePhoneNumber is required to verify the WhatsApp connection.");
  }
  return getTransport(options.apiBaseUrl, options.apiKey);
}

async function providerAction(fetchImpl, url, method, headers, description) {
  const response = await fetchImpl(url, {
    method,
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    await readJson(response, description);
    throw providerError(response, description);
  }
}

async function getSession(fetchImpl, sessionUrl, headers) {
  const response = await fetchImpl(sessionUrl, {
    method: "GET",
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (response.status === 404) return null;
  const session = await readJson(response, "session lookup");
  if (!response.ok) throw providerError(response, "session lookup");
  return session;
}

async function getConnectionState(
  tokenData,
  sourcePhoneNumber,
  { apiRoot, headers, fetchImpl },
) {
  const sessionName = encodeURIComponent(tokenData.whatsappSession);
  const sessionUrl = `${apiRoot}/api/sessions/${sessionName}`;
  const session = await getSession(fetchImpl, sessionUrl, headers);
  if (!session) return { status: "not_connected" };

  if (session.status === "WORKING") {
    let accountId = session.me?.id;
    if (typeof accountId !== "string") {
      const response = await fetchImpl(`${sessionUrl}/me`, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const me = await readJson(response, "connected account lookup");
      if (!response.ok) throw providerError(response, "connected account lookup");
      accountId = me?.id;
    }
    if (typeof accountId !== "string") return { status: "connecting" };
    const connectedNumber = accountId.split("@")[0].replace(/\D/g, "");
    const expectedNumber = sourcePhoneNumber.replace(/\D/g, "");
    return {
      status: connectedNumber === expectedNumber ? "connected" : "wrong_number",
    };
  }

  if (session.status === "SCAN_QR_CODE") {
    const response = await fetchImpl(
      `${apiRoot}/api/${sessionName}/auth/qr?format=image`,
      {
        method: "GET",
        headers: { ...headers, Accept: "application/json" },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    );
    if (response.status === 422) return { status: "qr_ready" };
    const qr = await readJson(response, "QR code retrieval");
    if (!response.ok) throw providerError(response, "QR code retrieval");
    if (typeof qr?.data !== "string") {
      throw new Error("The QR code response did not contain image data.");
    }
    return {
      status: "qr_ready",
      qrCode: qr.data,
      qrMimeType: typeof qr.mimetype === "string" ? qr.mimetype : "image/png",
    };
  }

  if (session.status === "STOPPED") return { status: "not_connected" };
  if (session.status === "FAILED") return { status: "failed" };
  return { status: "connecting" };
}

export async function getWhatsAppConnectionStatus(
  tokenData,
  sourcePhoneNumber,
  options = {},
) {
  const transport = validateConnectionInput(tokenData, sourcePhoneNumber, options);
  return getConnectionState(tokenData, sourcePhoneNumber, {
    ...transport,
    fetchImpl: options.fetchImpl || fetch,
  });
}

export async function startWhatsAppConnection(
  tokenData,
  sourcePhoneNumber,
  { restartWrongNumber = false, ...options } = {},
) {
  const transport = validateConnectionInput(tokenData, sourcePhoneNumber, options);
  const fetchImpl = options.fetchImpl || fetch;
  const sessionName = encodeURIComponent(tokenData.whatsappSession);
  const sessionUrl = `${transport.apiRoot}/api/sessions/${sessionName}`;
  let session = await getSession(fetchImpl, sessionUrl, transport.headers);
  let created = false;

  if (!session) {
    const response = await fetchImpl(`${transport.apiRoot}/api/sessions`, {
      method: "POST",
      headers: transport.headers,
      body: JSON.stringify({ name: tokenData.whatsappSession }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (response.status === 409) {
      session = await getSession(fetchImpl, sessionUrl, transport.headers);
      if (!session) {
        await readJson(response, "session creation");
        throw providerError(response, "session creation");
      }
    } else {
      if (!response.ok) {
        await readJson(response, "session creation");
        throw providerError(response, "session creation");
      }
      session = await getSession(fetchImpl, sessionUrl, transport.headers);
      created = true;
    }
  }

  if (created && !session) return { status: "connecting" };

  if (session?.status === "WORKING" && restartWrongNumber) {
    const state = await getConnectionState(tokenData, sourcePhoneNumber, {
      ...transport,
      fetchImpl,
    });
    if (state.status === "wrong_number") {
      await providerAction(
        fetchImpl,
        `${sessionUrl}/logout`,
        "POST",
        transport.headers,
        "session logout",
      );
      session = { status: "STOPPED" };
    }
  }

  if (session?.status === "FAILED") {
    await providerAction(
      fetchImpl,
      `${sessionUrl}/restart`,
      "POST",
      transport.headers,
      "session restart",
    );
  } else if (session?.status === "STOPPED") {
    await providerAction(
      fetchImpl,
      `${sessionUrl}/start`,
      "POST",
      transport.headers,
      "session start",
    );
  }

  return getConnectionState(tokenData, sourcePhoneNumber, {
    ...transport,
    fetchImpl,
  });
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
  const session = await readJson(response, "connected account lookup");
  if (!response.ok) throw providerError(response, "connected account lookup");

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
 * @param {string} message Message text, optional when sending media.
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
  if (typeof message !== "string" || (!message.trim() && !media)) {
    throw new TypeError("message must be a non-empty string unless media is included.");
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
          ...(message.trim() ? { caption: message } : {}),
        }
      : { text: message }),
  };
  const response = await fetchImpl(`${apiRoot}/api/${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const responseBody = await readJson(response, "message send");
  if (!response.ok) throw providerError(response, "message send");
  if (!messageId(responseBody)) {
    throw new Error("WAHA did not confirm acceptance with a message ID.");
  }
  return {
    ...responseBody,
    messages: [{ id: messageId(responseBody) }],
  };
}
