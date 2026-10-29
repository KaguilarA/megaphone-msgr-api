import { sendWhatsAppMessage as defaultSendWhatsAppMessage } from "../../integrations/whatsapp.js";
import { normalizePhoneNumber } from "../../utils/phoneNumber.js";

export default function ({
  id,
  model,
  receptorModel,
  populatedFields = [],
  phoneModel,
  tokenModel,
  contactModel,
  stateModel,
  mediaUploader,
  sendWhatsAppMessage = defaultSendWhatsAppMessage,
}) {

  function requestError(message, status = 400) {
    const error = new Error(message);
    error.status = status;
    return error;
  }

  async function getMessageState(state) {
    if (state || !stateModel) return state;

    const activeState =
      (await stateModel.getOne({ name: "active", entity: "Message" })) ||
      (await stateModel.save({
        name: "active",
        description: "Message is ready to send.",
        entity: "Message",
      }));

    return activeState?._id;
  }

  async function getSourcePhone(userId, sourcePhoneId) {
    if (!phoneModel) return undefined;
    if (!sourcePhoneId) {
      throw requestError("sourcePhoneId is required.");
    }

    const phone = await phoneModel.getById(sourcePhoneId);
    if (
      !phone ||
      String(phone.owner) !== String(userId) ||
      phone.ownerType !== "User"
    ) {
      throw requestError("The selected source phone does not belong to the user.", 403);
    }

    return phone;
  }

  async function getWhatsAppToken(userId, sourcePhone) {
    if (!tokenModel) return undefined;

    const sourcePhoneId = sourcePhone?._id;
    const linkedTokenId = sourcePhone?.tokens?.whatsapp;
    const token = linkedTokenId
      ? await tokenModel.getById(linkedTokenId)
      : await tokenModel.getOne({ owner: userId, phone: sourcePhoneId });
    if (token && String(token.owner) === String(userId) && String(token.phone) === String(sourcePhoneId) &&
        typeof token.whatsappToken === "string" && token.whatsappToken.trim() &&
        /^v\d+\.\d+$/.test(token.whatsappVersion) && /^\d+$/.test(token.whatsappPhoneNumberId)) {
      return token;
    }

    throw requestError("No WhatsApp token is configured for the selected phone. Configure a token for this number before sending.", 422);
  }

  async function resolveRecipients(userId, contacts) {
    if (!phoneModel || !contactModel) return [];
    const recipients = [];
    for (const contactId of contacts) {
      const contact = await contactModel.getById(contactId);
      if (!contact || String(contact.owner) !== String(userId)) {
        throw requestError("One of the selected contacts does not belong to the user.", 403);
      }

      const phoneNumbers = await phoneModel.getByCoincidence({
        ownerType: "Contact",
        owner: contactId,
      });
      const phone = phoneNumbers?.[0];
      if (!phone) {
        throw requestError("One of the selected contacts has no phone number.");
      }

      recipients.push(normalizePhoneNumber(phone).e164);
    }
    return [...new Set(recipients)];
  }

  async function createReceptors(messageId, contacts) {
    return Promise.all(
      contacts.map((contact) =>
        receptorModel.save({ message: messageId, contact }),
      ),
    );
  }

  /**
   * Return all messages sent by the authenticated user.
   * @param {import('express').Request} req Express request containing the user session.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching messages or an error response.
   */
  async function getAll(req, res) {
    try {
      const id = req.session.userId;
      const data = await model.getByCoincidence(
        { sender: id },
        { populate: populatedFields },
      );
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Return a specific message by its ID, including its recipient contacts.
   * @param {import('express').Request} req Express request containing the message ID.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the matching message with its receptors or an error response.
   */
  async function getById(req, res) {
    try {
      const messageId = req.params.id;
      const message = await model.getById(messageId, {
        populate: populatedFields,
      });
      if (!message) {
        return res.status(404).json({ message: "Message not found." });
      }
      if (String(message.sender?._id || message.sender) !== String(req.session?.userId)) {
        throw requestError("Message not found.", 404);
      }

      const receptors = await receptorModel.getByCoincidence(
        { message: messageId },
        { populate: "contact" },
      );

      res.status(200).json({ ...message.toJSON(), receptors });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  /**
   * Create a message for the authenticated user and its recipient list.
   * @param {import('express').Request} req Express request containing message data, the contact ID array, and the user session.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the created message with its receptors or an error response.
   */
  async function register(req, res) {
    let recordedMessage;
    try {
      const id = req.session.userId;
      const {
        contacts: rawContacts = [],
        sourcePhoneId,
        requestId,
        state,
        ...messageData
      } = req.body;
      if (phoneModel && !requestId) throw requestError("requestId is required to prevent duplicate sends.");
      if (requestId !== undefined && (typeof requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId))) {
        throw requestError("requestId must be a UUID.");
      }
      if (requestId) {
        const previous = await model.getOne({ sender: id, requestId });
        if (previous) return res.status(200).json(previous);
      }
      const contacts = typeof rawContacts === "string"
        ? JSON.parse(rawContacts)
        : rawContacts;
      if (!Array.isArray(contacts)) {
        throw requestError("contacts must be an array.");
      }
      if (!contacts.length || contacts.length > 100 || contacts.some((contact) => typeof contact !== "string" || !contact.trim()) || new Set(contacts).size !== contacts.length) {
        throw requestError("Select between 1 and 100 distinct contacts.");
      }
      if (typeof messageData.header !== "string" || !messageData.header.trim() ||
          typeof messageData.content !== "string" || !messageData.content.trim()) {
        throw requestError("A subject and message content are required.");
      }
      if (messageData.content.length > 4096) throw requestError("Message content cannot exceed 4096 characters.");
      const sourcePhone = await getSourcePhone(id, sourcePhoneId);
      const token = await getWhatsAppToken(id, sourcePhone);
      const recipients = await resolveRecipients(id, contacts);
      const messageState = await getMessageState();
      const media = req.file && mediaUploader
        ? await mediaUploader(req.file)
        : undefined;

      const deliveries = recipients.map((recipient) => ({ recipient, status: "pending" }));
      const newMessage = await model.save({
        header: messageData.header.trim(),
        content: messageData.content.trim(),
        sender: id,
        ...(requestId ? { requestId } : {}),
        deliveries,
        deliveryStatus: "pending",
        ...(sourcePhone ? { senderPhone: sourcePhone._id || sourcePhoneId } : {}),
        ...(messageState ? { state: messageState } : {}),
        ...(media ? { media } : {}),
      });
      recordedMessage = newMessage;

      const receptors = await createReceptors(newMessage._id, contacts);
      for (const delivery of deliveries) {
        delivery.status = "sending";
        await model.update(newMessage._id, { deliveries, deliveryStatus: "sending" });
        try {
          const result = await sendWhatsAppMessage(delivery.recipient, messageData.content.trim(), token, { media });
          delivery.status = "accepted";
          delivery.providerMessageId = result?.messages?.[0]?.id;
        } catch (error) {
          // A timeout cannot establish whether Meta accepted the message. Never retry automatically.
          delivery.status = error.providerRejected ? "rejected" : "unknown";
        }
        await model.update(newMessage._id, { deliveries });
      }
      const accepted = deliveries.filter((delivery) => delivery.status === "accepted").length;
      const deliveryStatus = accepted === deliveries.length ? "accepted" : accepted ? "partial" : "failed";
      if (deliveries.length) await model.update(newMessage._id, { deliveries, deliveryStatus });

      res.status(201).json({ ...newMessage.toJSON(), receptors, deliveries, deliveryStatus });
    } catch (error) {
      if (error.code === 11000 && req.body.requestId) {
        const previous = await model.getOne({ sender: req.session.userId, requestId: req.body.requestId });
        if (previous) return res.status(200).json(previous);
      }
      res.status(error.status || (error instanceof SyntaxError || error.name === "CastError" ? 400 : 500)).json({
        error: recordedMessage ? "El envío quedó registrado. Consulta el historial antes de volver a enviarlo." : error.message,
        ...(recordedMessage ? { messageId: recordedMessage._id } : {}),
      });
    }
  }

  async function remove(req, res) {
    try {
      const messageId = req.params.id;
      const message = await model.getById(messageId);
      if (!message || String(message.sender?._id || message.sender) !== String(req.session?.userId)) {
        throw requestError("Message not found.", 404);
      }
      const receptors = await receptorModel.getByCoincidence({ message: messageId });

      await Promise.all(
        receptors.map((receptor) => receptorModel.delete(receptor._id)),
      );
      await model.delete(messageId);
      return res.status(204).end();
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  return {
    getAll,
    getById,
    register,
    delete: remove,
  };
};
