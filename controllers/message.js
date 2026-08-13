import { OwlController } from "owl-expressjs-utils";

export const buildMetaPayload = ({ recipientPhone, content }) => ({
  messaging_product: "whatsapp",
  to: recipientPhone,
  type: "text",
  text: {
    body: content,
  },
});

export const resolveMetaSettings = (body = {}, user = null) => {
  const recipientPhone = body.to || body.recipientPhoneNumber;
  const content = body.content || body.message || body.text;
  const token = user?.tokens?.whatsappToken || body.whatsappToken;
  const phoneNumberId = body.phoneNumberId;
  return {
    recipientPhone,
    content,
    token,
    phoneNumberId,
  };
};

export default ({ entityId = "Message", model, populatedFields = [] }) => {
  const genericController = OwlController({
    entityId,
    model,
    populatedFields,
  });

  async function send(req, res) {
    try {
      const { recipientPhone, content, token, phoneNumberId } =
        resolveMetaSettings(req.body, req.user);

      if (!recipientPhone) {
        return res.status(400).json({
          message: "Se requiere el número de destino en el campo 'to'.",
        });
      }

      if (!content) {
        return res.status(400).json({
          message: "Se requiere el contenido del mensaje.",
        });
      }

      if (!token || !phoneNumberId) {
        return res.status(400).json({
          message:
            "No se encontró el token de WhatsApp o el ID del número de teléfono.",
        });
      }

      const metaPayload = buildMetaPayload({ recipientPhone, content });
      const metaApiUrl =
        process.env.META_API_URL || "https://graph.facebook.com";
      const metaApiVersion = process.env.META_API_VERSION || "v22.0";
      const endpoint = `${metaApiUrl}/${metaApiVersion}/${phoneNumberId}/messages`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metaPayload),
      });

      const metaResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        return res.status(502).json({
          message: "No se pudo enviar el mensaje a Meta.",
          error: metaResponse.error || metaResponse,
        });
      }

      let savedMessage = null;
      const receiver = req.body.receiver
        ? Array.isArray(req.body.receiver)
          ? req.body.receiver
          : [req.body.receiver]
        : [];

      if (receiver.length > 0) {
        savedMessage = await model.save({
          content,
          sender: req.session?._id || req.body.sender,
          receiver,
          state: req.body.state,
        });
      }

      return res.status(201).json({
        message: "Mensaje enviado correctamente.",
        meta: metaResponse,
        savedMessage,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error al enviar el mensaje.",
        error: error.message || error,
      });
    }
  }

  return {
    ...genericController,
    send,
  };
};
