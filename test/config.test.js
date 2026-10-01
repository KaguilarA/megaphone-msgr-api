import test from "node:test";
import assert from "node:assert/strict";
import validateConfig from "../utils/validateConfig.js";

const validConfig = {
  DB_HOST: "mongodb://127.0.0.1:27017/megaphone",
  DB_NAME: "megaphone",
  FRONTEND_URL: "https://app.example.com",
  NODE_ENV: "production",
  SESSION_SECRET: "test-session-secret-that-is-long-enough",
  ENCRYPTION_KEY: "a".repeat(64),
};

test("accepts a complete application configuration", () => {
  assert.doesNotThrow(() => validateConfig(validConfig));
});

test("rejects missing required settings without disclosing their values", () => {
  assert.throws(
    () => validateConfig({ ...validConfig, DB_HOST: "", SESSION_SECRET: "" }),
    (error) => {
      assert.match(error.message, /DB_HOST/);
      assert.match(error.message, /SESSION_SECRET/);
      assert.doesNotMatch(error.message, /test-session-secret/);
      return true;
    },
  );
});

test("rejects weak secrets, malformed encryption keys, and invalid ports", () => {
  assert.throws(
    () =>
      validateConfig({
        ...validConfig,
        SESSION_SECRET: "short",
        ENCRYPTION_KEY: "not-a-key",
        PORT: "70000",
      }),
    /SESSION_SECRET.*ENCRYPTION_KEY.*PORT/,
  );
});

test("rejects non-origin frontend URLs", () => {
  assert.throws(
    () =>
      validateConfig({
        ...validConfig,
        FRONTEND_URL: "https://app.example.com/dashboard",
      }),
    /FRONTEND_URL/,
  );
});
