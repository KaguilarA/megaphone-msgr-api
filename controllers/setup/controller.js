import mongoose from "mongoose";
import { INSTALLATION_ID } from "../../setup/bootstrap.js";

export default function ({ userModel, emailModel, phoneModel, tokenModel, contactModel, messageModel,
  installationModel, isDatabaseReady = () => mongoose.connection.readyState === 1, serverFeatures = {} }) {
  const fail = (message, status) => { throw Object.assign(new Error(message), { status }); };
  const handle = (fn) => async (req, res) => {
    try {
      if (!req.session?.userId) fail("Debes iniciar sesión.", 401);
      if (!isDatabaseReady()) fail("La base de datos no está disponible. Intenta de nuevo.", 503);
      return await fn(req, res);
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.status ? error.message : "No se pudo consultar la configuración." });
    }
  };
  return {
    status: handle(async (req, res) => {
      const owner = req.session.userId;
      const [user, emails, phones, tokens, contacts, messages, installation] = await Promise.all([
        userModel.getById(owner), emailModel.getByCoincidence({ owner, ownerType: "User" }),
        phoneModel.getByCoincidence({ owner, ownerType: "User" }), tokenModel.getByCoincidence({ owner }),
        contactModel.getByCoincidence({ owner }), messageModel.getByCoincidence({ sender: owner }),
        installationModel.getById(INSTALLATION_ID),
      ]);
      if (!user) fail("Usuario no encontrado.", 404);
      const phoneIds = new Set(phones.map((phone) => String(phone._id)));
      const configuredPhones = new Set(tokens.filter((token) => phoneIds.has(String(token.phone)) &&
        token.whatsappToken && /^v\d+\.\d+$/.test(token.whatsappVersion) && /^\d+$/.test(token.whatsappPhoneNumberId)).map((token) => String(token.phone)));
      return res.json({
        onboardingCompletedAt: user.onboardingCompletedAt || null,
        account: { name: user.name, lastName: user.lastName, email: emails[0]?.email || "" },
        checks: {
          profileReady: Boolean(user.name && user.lastName && emails.length), phoneCount: phones.length,
          whatsappConfiguredCount: configuredPhones.size,
          smtpConfigured: emails.some((email) => email.smtpHost && email.smtpUser && email.smtpPassword && email.smtpPort >= 1 && email.smtpPort <= 65535),
          contactCount: contacts.length,
          acceptedMessageCount: messages.filter((message) => message.deliveries?.some((delivery) => delivery.status === "accepted")).length,
        },
        server: { databaseConnected: true, installationInitialized: Boolean(installation?.completedAt),
          mediaUploadsConfigured: Boolean(serverFeatures.mediaUploadsConfigured), webhookConfigured: Boolean(serverFeatures.webhookConfigured) },
      });
    }),
    complete: handle(async (req, res) => {
      const user = await userModel.getById(req.session.userId);
      if (!user) fail("Usuario no encontrado.", 404);
      const completedAt = user.onboardingCompletedAt || new Date();
      await userModel.update(user._id, { onboardingCompletedAt: completedAt }, { runValidators: true });
      return res.json({ onboardingCompletedAt: completedAt });
    }),
  };
}
