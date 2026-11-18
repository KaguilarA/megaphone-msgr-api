import { OwlSession } from "owl-expressjs-utils";
import WahaWebhook from "../routes/webhooks/waha.js";
import {
  ContactModel,
  MessageModel,
  PermissionModel,
  PhoneNumberModel,
  TokenModel,
  UserPermissionModel,
  WhatsAppAutomationModel,
  WhatsAppConversationMessageModel,
} from "../models/models.js";
import { WahaApiKey, WahaApiUrl, WahaWebhookHmacKey } from "../consts/index.js";

/**
 * Initialize API routes for the Express application.
 * @param {import('express').Application} app 
 * @param {Array<{url: string, config: Object, router: Function}>} ApiConfig Configuration for the API routes.
 * @param {string} sessionSecret Connection secret for the session.
 * @param {string} nodeEnv Node environment (e.g., "development" or "production").
 * @param {string} dbName Name of the database.
 * @param {string} dbHost Hostname of the database (e.g., "localhost:27017").
 */
export default function (
  app,
  ApiConfig,
  sessionSecret,
  nodeEnv,
  dbName,
  dbHost,
) {
  app.use(OwlSession(sessionSecret, nodeEnv, dbName, dbHost));
  app.use("/webhooks/waha", WahaWebhook({
    hmacKey: WahaWebhookHmacKey,
    tokenModel: TokenModel,
    phoneModel: PhoneNumberModel,
    contactModel: ContactModel,
    messageModel: MessageModel,
    automationModel: WhatsAppAutomationModel,
    conversationMessageModel: WhatsAppConversationMessageModel,
    permissionModel: PermissionModel,
    userPermissionModel: UserPermissionModel,
    whatsappConfig: { apiBaseUrl: WahaApiUrl, apiKey: WahaApiKey },
  }));

  ApiConfig.forEach(({ url, config, router: childRouter }) =>
    app.use(url, childRouter(config)),
  );
}
