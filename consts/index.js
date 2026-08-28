process.loadEnvFile();

export const ClusterEnabled = process.env.CLUSTER_ENABLED === "true";
export const Port = Number(process.env.PORT) || 3000;
export const DbHost = process.env.DB_HOST;
export const DbName = process.env.DB_NAME;
export const FrontendUrl = process.env.FRONTEND_URL;
export const NodeEnv = process.env.NODE_ENV;
export const SessionSecret = process.env.SESSION_SECRET || "1234567890";