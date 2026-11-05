import { OwlSession } from "owl-expressjs-utils";
import WhatsAppWebhook from "../routes/webhooks/whatsapp.js";
import { TokenModel } from "../models/models.js";
import {
  WhatsAppAppSecret,
  WhatsAppAutoReplyKeyword,
  WhatsAppAutoReplyText,
  WhatsAppWebhookVerifyToken,
} from "../consts/index.js";

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
  app.use("/webhooks", WhatsAppWebhook({
    verifyToken: WhatsAppWebhookVerifyToken,
    appSecret: WhatsAppAppSecret,
    tokenModel: TokenModel,
    autoReplyKeyword: WhatsAppAutoReplyKeyword,
    autoReplyText: WhatsAppAutoReplyText,
  }));

  ApiConfig.forEach(({ url, config, router: childRouter }) =>
    app.use(url, childRouter(config)),
  );
}
