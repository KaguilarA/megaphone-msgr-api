const DEFAULT_API_BASE_URL = "https://graph.facebook.com";
const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Send a plain-text WhatsApp message through Meta's Cloud API.
 *
 * @param {string} recipient E.164 phone number, with or without a leading plus.
 * @param {string} message Message text.
 * @param {{
 *   whatsappToken: string,
 *   whatsappVersion: string,
 *   whatsappPhoneNumberId: string
 * }} tokenData Provider credential record returned by the Token model.
 * @param {{ apiBaseUrl?: string, fetchImpl?: typeof fetch }} options Transport settings.
 * @returns {Promise<object>} Meta's message response.
 */
export async function sendWhatsAppMessage(
  recipient,
  message,
  tokenData,
  { apiBaseUrl = DEFAULT_API_BASE_URL, fetchImpl = fetch } = {},
) {
  if (typeof recipient !== "string" || !/^\+?[1-9]\d{7,14}$/.test(recipient)) {
    throw new TypeError("recipient must be a valid E.164 phone number.");
  }
  if (typeof message !== "string" || !message.trim()) {
    throw new TypeError("message must be a non-empty string.");
  }
  if (
    !tokenData ||
    typeof tokenData.whatsappToken !== "string" ||
    !tokenData.whatsappToken
  ) {
    throw new Error("A Token model record with whatsappToken is required.");
  }
  if (
    typeof tokenData.whatsappPhoneNumberId !== "string" ||
    !/^\d+$/.test(tokenData.whatsappPhoneNumberId)
  ) {
    throw new Error(
      "The Token model record must contain a valid whatsappPhoneNumberId.",
    );
  }
  if (
    typeof tokenData.whatsappVersion !== "string" ||
    !/^v\d+\.\d+$/.test(tokenData.whatsappVersion)
  ) {
    throw new Error(
      "The Token model record must contain a valid whatsappVersion.",
    );
  }

  const apiUrl = new URL(apiBaseUrl);
  if (apiUrl.protocol !== "https:" || apiUrl.username || apiUrl.password) {
    throw new Error(
      "META_API_URL must be an HTTPS URL without embedded credentials.",
    );
  }
  apiUrl.pathname = `${apiUrl.pathname.replace(/\/$/, "")}/${tokenData.whatsappVersion}/${tokenData.whatsappPhoneNumberId}/messages`;

  const response = await fetchImpl(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenData.whatsappToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient.replace(/^\+/, ""),
      type: "text",
      text: { preview_url: false, body: message },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  let responseBody;
  try {
    responseBody = await response.json();
  } catch (error) {
    if (!response.ok) {
      throw new Error(
        `WhatsApp provider request failed (HTTP ${response.status}).`,
      );
    }
    throw new Error("WhatsApp provider returned an invalid JSON response.", {
      cause: error,
    });
  }

  if (!response.ok) {
    const providerMessage = responseBody?.error?.message;
    throw new Error(
      providerMessage
        ? `WhatsApp provider rejected the message: ${providerMessage}`
        : `WhatsApp provider request failed (HTTP ${response.status}).`,
    );
  }

  return responseBody;
}
