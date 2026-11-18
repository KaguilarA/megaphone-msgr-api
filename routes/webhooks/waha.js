import { createHmac, timingSafeEqual } from "node:crypto";
import { Router } from "express";
import { normalizePhoneNumber } from "../../utils/phoneNumber.js";
import { renderAutoReplyTemplate } from "../../utils/autoReplyTemplate.js";
import {
  sendWhatsAppMessage as defaultSendWhatsAppMessage,
  verifyWhatsAppSession as defaultVerifyWhatsAppSession,
} from "../../integrations/whatsapp.js";

function hasValidSignature(rawBody, signature, algorithm, secret) {
  if (
    !rawBody ||
    !signature ||
    algorithm?.toLowerCase() !== "sha512" ||
    !secret ||
    !/^[\da-f]{128}$/i.test(signature)
  ) {
    return false;
  }
  const expected = createHmac("sha512", secret).update(rawBody).digest();
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function normalizeDirectPhone(address) {
  if (typeof address !== "string") return undefined;
  const match = /^([1-9]\d{7,14})(?:@(?:c\.us|s\.whatsapp\.net))?$/.exec(address);
  return match ? `+${match[1]}` : undefined;
}

function latestMessage(messages, direction) {
  return messages.find((message) => message.direction === direction && message.text?.trim())?.text;
}

function getProviderMessageId(payload) {
  const id = payload?.id;
  if (typeof id === "string") return id;
  if (typeof id?._serialized === "string") return id._serialized;
  if (typeof payload?._data?.id?._serialized === "string") {
    return payload._data.id._serialized;
  }
  return undefined;
}

export default ({
  hmacKey,
  tokenModel,
  phoneModel,
  contactModel,
  messageModel,
  automationModel,
  conversationMessageModel,
  permissionModel,
  userPermissionModel,
  whatsappConfig,
  verifyWhatsAppSession = defaultVerifyWhatsAppSession,
  sendWhatsAppMessage = defaultSendWhatsAppMessage,
}) => {
  const router = Router();

  async function receive(req, res) {
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(JSON.stringify(req.body || {}));
    if (!hasValidSignature(
      rawBody,
      req.header("x-webhook-hmac"),
      req.header("x-webhook-hmac-algorithm"),
      hmacKey,
    )) {
      return res.sendStatus(401);
    }

    let event;
    try {
      event = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return res.status(400).json({ error: "Invalid webhook JSON." });
    }
    if (event.event !== "message" || event.payload?.fromMe === true) {
      return res.sendStatus(200);
    }

    const senderNumber = normalizeDirectPhone(event.payload?.from);
    const providerMessageId = getProviderMessageId(event.payload);
    const sessionName = event.session;
    if (
      !senderNumber ||
      typeof providerMessageId !== "string" ||
      !providerMessageId.trim() ||
      typeof sessionName !== "string"
    ) {
      return res.sendStatus(200);
    }

    try {
      const token = await tokenModel.getOne({ whatsappSession: sessionName });
      if (!token?.owner || !token.phone) return res.sendStatus(200);
      const sourcePhone = await phoneModel.getById(token.phone);
      if (
        !sourcePhone ||
        String(sourcePhone.owner) !== String(token.owner) ||
        sourcePhone.ownerType !== "User"
      ) {
        return res.sendStatus(200);
      }

      const sourcePhoneNumber = normalizePhoneNumber(sourcePhone).e164;
      if (senderNumber === sourcePhoneNumber) return res.sendStatus(200);
      const duplicate = await conversationMessageModel.getOne({
        senderPhone: sourcePhone._id,
        providerMessageId,
      });
      if (duplicate) return res.sendStatus(200);

      const previousMessages = await conversationMessageModel.getLatest(
        { owner: token.owner, contactPhone: senderNumber },
        50,
      );
      const previousCampaigns = await messageModel.getLatestForRecipient(
        token.owner,
        senderNumber,
        50,
      );
      const history = [
        ...previousMessages,
        ...previousCampaigns.map((message) => ({
          direction: "outbound",
          text: message.content,
          createdAt: message.createdAt,
        })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const candidatePhones = await phoneModel.getByCoincidence({
        ownerType: "Contact",
        e164: senderNumber,
      });
      let contact;
      let contactPhone;
      for (const phone of candidatePhones) {
        const foundContact = await contactModel.getById(phone.owner);
        if (foundContact && String(foundContact.owner) === String(token.owner)) {
          if (contact) {
            contact = undefined;
            contactPhone = undefined;
            break;
          }
          contact = foundContact;
          contactPhone = phone;
        }
      }

      const messageText = typeof event.payload?.body === "string"
        ? event.payload.body.trim()
        : "";
      const inbound = await conversationMessageModel.save({
        owner: token.owner,
        senderPhone: sourcePhone._id,
        ...(contact ? { contact: contact._id } : {}),
        contactPhone: senderNumber,
        direction: "inbound",
        providerMessageId,
        text: messageText,
        status: "received",
        autoReplyStatus: "not_matched",
      }).catch((error) => {
        if (error.code === 11000) return null;
        throw error;
      });
      if (!inbound) return res.sendStatus(200);

      if (!contact || !messageText || !permissionModel || !userPermissionModel) {
        return res.sendStatus(200);
      }
      const permission = await permissionModel.getOne({
        entity: "Message",
        name: "register",
      });
      const assignment = permission && await userPermissionModel.getOne({
        user: token.owner,
        permission: permission._id,
      });
      if (!assignment) return res.sendStatus(200);

      const automation = await automationModel.getOne({ owner: token.owner });
      if (!automation?.enabled) return res.sendStatus(200);
      const normalizedText = messageText.toLocaleLowerCase();
      const rule = automation.rules?.find((item) =>
        item.enabled !== false &&
        normalizedText.includes(item.keyword.toLocaleLowerCase()),
      );
      if (!rule) return res.sendStatus(200);

      const renderedReply = renderAutoReplyTemplate(rule.response, {
        "contact.name": contact.name,
        "contact.phone": normalizePhoneNumber(contactPhone).e164,
        "message.text": messageText,
        "history.lastInbound": latestMessage(history, "inbound"),
        "history.lastReply": latestMessage(history, "outbound"),
      });
      if (!renderedReply) {
        await conversationMessageModel.update(inbound._id, {
          autoReplyStatus: "missing_data",
          matchedKeyword: rule.keyword,
        });
        return res.sendStatus(200);
      }

      await conversationMessageModel.update(inbound._id, {
        autoReplyStatus: "pending",
        matchedKeyword: rule.keyword,
      });
      try {
        await verifyWhatsAppSession(token, sourcePhoneNumber, whatsappConfig);
        const result = await sendWhatsAppMessage(
          senderNumber,
          renderedReply,
          token,
          {
            ...whatsappConfig,
            sourcePhoneNumber,
            sessionVerified: true,
          },
        );
        const providerReplyId = result?.messages?.[0]?.id;
        await conversationMessageModel.save({
          owner: token.owner,
          senderPhone: sourcePhone._id,
          contact: contact._id,
          contactPhone: senderNumber,
          direction: "outbound",
          ...(providerReplyId ? { providerMessageId: providerReplyId } : {}),
          text: renderedReply,
          status: "accepted",
          replyToMessage: inbound._id,
        });
        await conversationMessageModel.update(inbound._id, {
          autoReplyStatus: "accepted",
        });
      } catch (error) {
        await conversationMessageModel.update(inbound._id, {
          autoReplyStatus: error.providerRejected ? "failed" : "unknown",
        });
        console.error("WAHA automatic reply failed:", error.message);
      }

      return res.sendStatus(200);
    } catch (error) {
      console.error("WAHA webhook processing failed:", error.message);
      return res.sendStatus(500);
    }
  }

  router.post("/", receive);
  return router;
};

export { hasValidSignature, normalizeDirectPhone };
