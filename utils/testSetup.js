import { randomBytes } from "node:crypto";

process.env.NODE_ENV ??= "test";
process.env.ENCRYPTION_KEY ??= randomBytes(32).toString("hex");
process.env.ENCRYPTION_ALGORITHM ??= "aes-256-gcm";
