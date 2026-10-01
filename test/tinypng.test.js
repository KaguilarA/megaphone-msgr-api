import test from "node:test";
import assert from "node:assert/strict";
import { compressImageBuffer } from "../integrations/tinypng.js";

test("TinyPNG requires an API key before compressing an image", async () => {
  await assert.rejects(
    compressImageBuffer(Buffer.from("image")),
    /TINYPNG_API_KEY is required/,
  );
});

test("TinyPNG rejects an empty image buffer", async () => {
  await assert.rejects(
    compressImageBuffer(Buffer.alloc(0), "test-key"),
    /image buffer is required/,
  );
});