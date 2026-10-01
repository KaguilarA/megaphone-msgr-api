import { createHmac, timingSafeEqual } from "node:crypto";
import { Router } from "express";
import { sendWhatsAppMessage } from "../../integrations/whatsapp.js";

function hasValidSignature(rawBody, signature, appSecret) {
  if (!rawBody || !signature || !appSecret || !signature.startsWith("sha256=")) {
    return false;
  }

  const expected = createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");
  const received = signature.slice("sha256=".length);
  if (received.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

function extractIncomingMessages(payload) {
  return (payload?.entry || []).flatMap((entry) =>
    (entry.changes || []).flatMap((change) => change.value?.messages || []),
  );
}

export default ({
  verifyToken,
  appSecret,
  tokenModel,
  autoReplyKeyword,
  autoReplyText,
}) => {
  const router = Router();

  router.get("/whatsapp", (req, res) => {
    const isValid =
      req.query["hub.mode"] === "subscribe" &&
      req.query["hub.verify_token"] === verifyToken;

    if (!isValid) return res.sendStatus(403);
    return res.status(200).send(req.query["hub.challenge"]);
  });

  router.post("/whatsapp", async (req, res) => {
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(JSON.stringify(req.body || {}));
    if (!hasValidSignature(rawBody, req.header("x-hub-signature-256"), appSecret)) {
      return res.sendStatus(401);
    }

    const payload = JSON.parse(rawBody.toString("utf8"));
    const incomingMessages = extractIncomingMessages(payload);
    if (autoReplyKeyword && autoReplyText && tokenModel) {
      for (const incoming of incomingMessages) {
        const text = incoming.text?.body?.trim().toLowerCase();
        if (!text || !text.includes(autoReplyKeyword.toLowerCase())) continue;

        const phoneNumberId = payload.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
        const token = await tokenModel.getOne({ whatsappPhoneNumberId: phoneNumberId });
        if (token) {
          await sendWhatsAppMessage(incoming.from, autoReplyText, token);
        }
      }
    }

    return res.sendStatus(200);
  });

  return router;
};

export { extractIncomingMessages, hasValidSignature };
