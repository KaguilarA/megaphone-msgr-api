import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { prepareWhatsAppMedia } from "../integrations/media.js";

test("prepares videos as base64 data with a safe filename and metadata", async () => {
  const buffer = Buffer.from("video content");
  const media = await prepareWhatsAppMedia({ mimetype: "video/mp4", buffer });

  assert.deepEqual(media, {
    type: "video",
    data: buffer.toString("base64"),
    filename: "attachment.mp4",
    mimeType: "video/mp4",
    bytes: buffer.length,
  });
});

test("optimizes images before encoding them for WAHA", async () => {
  const input = await sharp({
    create: {
      width: 64,
      height: 64,
      channels: 3,
      background: { r: 20, g: 80, b: 140 },
    },
  })
    .png({ compressionLevel: 0 })
    .toBuffer();

  let uploadedBuffer;
  const media = await prepareWhatsAppMedia(
    { mimetype: "image/png", buffer: input },
    {},
    async (buffer) => {
      uploadedBuffer = buffer;
      return { secure_url: "https://res.cloudinary.com/example/image/upload/photo.png" };
    },
  );
  const decoded = Buffer.from(media.data, "base64");
  const metadata = await sharp(decoded).metadata();

  assert.equal(media.type, "image");
  assert.equal(media.filename, "attachment.png");
  assert.equal(media.mimeType, "image/png");
  assert.equal(media.bytes, decoded.length);
  assert.equal(media.mediaUrl, "https://res.cloudinary.com/example/image/upload/photo.png");
  assert.deepEqual(uploadedBuffer, decoded);
  assert.equal(metadata.format, "png");
  assert.deepEqual([metadata.width, metadata.height], [64, 64]);
  assert.ok(decoded.length <= input.length);
});

test("requires Cloudinary credentials for image attachments", async () => {
  const image = await sharp({
    create: {
      width: 16,
      height: 16,
      channels: 3,
      background: { r: 40, g: 90, b: 140 },
    },
  }).png().toBuffer();

  await assert.rejects(
    prepareWhatsAppMedia({ mimetype: "image/png", buffer: image }),
    (error) => error.status === 503 && /CLOUDINARY/.test(error.message),
  );
});

test("rejects empty or unsupported media buffers", async () => {
  await assert.rejects(
    prepareWhatsAppMedia({ mimetype: "video/mp4", buffer: Buffer.alloc(0) }),
    /could not be prepared/,
  );
  await assert.rejects(
    prepareWhatsAppMedia({ mimetype: "image/gif", buffer: Buffer.from("image") }),
    /could not be prepared/,
  );
});
