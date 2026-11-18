import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { optimizeImageBuffer } from "../integrations/imageOptimization.js";

test("optimizes supported images while preserving their formats and dimensions", async () => {
  const width = 256;
  const height = 256;
  const pixels = Buffer.alloc(width * height * 3);
  let seed = 123456789;
  for (let index = 0; index < pixels.length; index += 1) {
    seed = (1664525 * seed + 1013904223) >>> 0;
    pixels[index] = seed >>> 24;
  }

  const source = sharp(pixels, { raw: { width, height, channels: 3 } });
  const fixtures = [
    ["image/jpeg", "jpeg", await source.clone().jpeg({ quality: 100 }).toBuffer()],
    ["image/png", "png", await source.clone().png({ compressionLevel: 0 }).toBuffer()],
    ["image/webp", "webp", await source.clone().webp({ quality: 100 }).toBuffer()],
  ];

  for (const [mimeType, format, input] of fixtures) {
    const output = await optimizeImageBuffer(input, mimeType);
    const metadata = await sharp(output).metadata();
    assert.ok(output.length <= input.length);
    assert.equal(metadata.format, format);
    assert.equal(metadata.width, width);
    assert.equal(metadata.height, height);
  }

  assert.ok(
    (await optimizeImageBuffer(fixtures[0][2], "image/jpeg")).length < fixtures[0][2].length,
  );
});

test("rejects unsupported image MIME types", async () => {
  await assert.rejects(
    optimizeImageBuffer(Buffer.from("image"), "image/gif"),
    /Unsupported image MIME type/,
  );
});
