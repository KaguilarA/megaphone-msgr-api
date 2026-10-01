import { sendWhatsAppMessage as defaultSendWhatsAppMessage } from "../../integrations/whatsapp.js";

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

  async function getWhatsAppToken(userId, sourcePhoneId) {
    if (!tokenModel) return undefined;

    const token = await tokenModel.getOne({
      owner: userId,
      phone: sourcePhoneId,
    });
    if (!token) {
      throw requestError("No WhatsApp token is configured for the selected phone.", 422);
    }

    return token;
  }

  async function sendToContacts(userId, contacts, message, token, media) {
    if (!phoneModel || !contactModel || !token) return;

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

      const recipient = `${phone.countryNumber || ""}${phone.phone || ""}`.replace(
        /[\s()-]/g,
        "",
      );
      await sendWhatsAppMessage(recipient, message, token, { media });
    }
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

      const receptors = await receptorModel.getByCoincidence(
        { message: messageId },
        { populate: "contact" },
      );

      res.status(200).json({ ...message.toJSON(), receptors });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create a message for the authenticated user and its recipient list.
   * @param {import('express').Request} req Express request containing message data, the contact ID array, and the user session.
   * @param {import('express').Response} res Express response.
   * @returns {Promise<void>} Sends the created message with its receptors or an error response.
   */
  async function register(req, res) {
    try {
      const id = req.session.userId;
      const {
        contacts: rawContacts = [],
        sourcePhoneId,
        state,
        ...messageData
      } = req.body;
      const contacts = typeof rawContacts === "string"
        ? JSON.parse(rawContacts)
        : rawContacts;
      if (!Array.isArray(contacts)) {
        throw requestError("contacts must be an array.");
      }
      const sourcePhone = await getSourcePhone(id, sourcePhoneId);
      const token = await getWhatsAppToken(id, sourcePhoneId);
      const messageState = await getMessageState(state);
      const media = req.file && mediaUploader
        ? await mediaUploader(req.file)
        : undefined;

      await sendToContacts(id, contacts, messageData.content, token, media);

      const newMessage = await model.save({
        ...messageData,
        sender: id,
        ...(sourcePhone ? { senderPhone: sourcePhone._id || sourcePhoneId } : {}),
        ...(messageState ? { state: messageState } : {}),
        ...(media ? { media } : {}),
      });

      const receptors = await createReceptors(newMessage._id, contacts);

      res.status(201).json({ ...newMessage.toJSON(), receptors });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  async function remove(req, res) {
    try {
      const messageId = req.params.id;
      const receptors = await receptorModel.getByCoincidence({ message: messageId });

      await Promise.all(
        receptors.map((receptor) => receptorModel.delete(receptor._id)),
      );
      await model.delete(messageId);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return {
    getAll,
    getById,
    register,
    delete: remove,
  };
};
