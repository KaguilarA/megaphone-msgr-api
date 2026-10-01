export const ClusterEnabled = process.env.CLUSTER_ENABLED === "true";
export const Port = Number(process.env.PORT) || 3000;
export const DbHost = process.env.DB_HOST;
export const DbName = process.env.DB_NAME;
export const EncryptionKey = process.env.ENCRYPTION_KEY;
export const FrontendUrl = process.env.FRONTEND_URL;
export const NodeEnv = process.env.NODE_ENV;
export const SessionSecret = process.env.SESSION_SECRET;
export const CloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
export const CloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
export const CloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
export const CloudinaryFolder = process.env.CLOUDINARY_FOLDER || "megaphone/messages";
export const TinyPngApiKey = process.env.TINYPNG_API_KEY;
export const WhatsAppWebhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
export const WhatsAppAppSecret = process.env.WHATSAPP_APP_SECRET;
export const WhatsAppAutoReplyKeyword = process.env.WHATSAPP_AUTO_REPLY_KEYWORD;
export const WhatsAppAutoReplyText = process.env.WHATSAPP_AUTO_REPLY_TEXT;
export const EncryptionAlgorithm =
  process.env.ENCRYPTION_ALGORITHM || "aes-256-gcm";