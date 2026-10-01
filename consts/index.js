export const ClusterEnabled = process.env.CLUSTER_ENABLED === "true";
export const ClusterWorkers = Number(process.env.CLUSTER_WORKERS) || 1;
export const Port = Number(process.env.PORT) || 3000;
export const DbHost = process.env.DB_HOST;
export const DbName = process.env.DB_NAME;
export const FrontendUrl = process.env.FRONTEND_URL;
export const NodeEnv = process.env.NODE_ENV;
export const SessionSecret = process.env.SESSION_SECRET;
export const EncryptionKey = process.env.ENCRYPTION_KEY;
export const EncryptionAlgorithm =
  process.env.ENCRYPTION_ALGORITHM || "aes-256-gcm";