const REQUIRED_VARIABLES = [
  "DB_HOST",
  "DB_NAME",
  "FRONTEND_URL",
  "NODE_ENV",
  "SESSION_SECRET",
  "ENCRYPTION_KEY",
];

export default function validateConfig(env = process.env) {
  const missing = REQUIRED_VARIABLES.filter((name) => !env[name]?.trim());
  const invalid = [];

  if (env.SESSION_SECRET && env.SESSION_SECRET.length < 32) {
    invalid.push("SESSION_SECRET (must be at least 32 characters)");
  }
  if (env.ENCRYPTION_KEY && !/^[\da-fA-F]{64}$/.test(env.ENCRYPTION_KEY)) {
    invalid.push("ENCRYPTION_KEY (must be 64 hexadecimal characters)");
  }
  if (
    env.ENCRYPTION_ALGORITHM &&
    env.ENCRYPTION_ALGORITHM !== "aes-256-gcm"
  ) {
    invalid.push("ENCRYPTION_ALGORITHM (supported value: aes-256-gcm)");
  }
  if (
    env.NODE_ENV &&
    !["development", "test", "production"].includes(env.NODE_ENV)
  ) {
    invalid.push("NODE_ENV (supported values: development, test, production)");
  }

  if (env.PORT !== undefined) {
    const port = Number(env.PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      invalid.push("PORT (must be an integer from 1 to 65535)");
    }
  }

  if (env.FRONTEND_URL) {
    try {
      const frontendUrl = new URL(env.FRONTEND_URL);
      if (
        !["http:", "https:"].includes(frontendUrl.protocol) ||
        frontendUrl.origin !== env.FRONTEND_URL
      ) {
        invalid.push("FRONTEND_URL (must be an HTTP(S) origin)");
      }
    } catch {
      invalid.push("FRONTEND_URL (must be a valid HTTP(S) origin)");
    }
  }

  if (env.CLUSTER_ENABLED === "true" && env.CLUSTER_WORKERS) {
    const workers = Number(env.CLUSTER_WORKERS);
    if (!Number.isInteger(workers) || workers < 1) {
      invalid.push("CLUSTER_WORKERS (must be a positive integer)");
    }
  }

  if (missing.length || invalid.length) {
    const details = [
      missing.length ? `Missing required variables: ${missing.join(", ")}.` : "",
      invalid.length ? `Invalid configuration: ${invalid.join(", ")}.` : "",
    ]
      .filter(Boolean)
      .join(" ");
    throw new Error(`Invalid application configuration. ${details}`);
  }
}
