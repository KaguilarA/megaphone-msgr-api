import sharp from "sharp";

const encoders = {
  "image/jpeg": (image) => image.jpeg({ quality: 82 }),
  "image/png": (image) => image.png({ compressionLevel: 9, adaptiveFiltering: true }),
  "image/webp": (image) => image.webp({ quality: 82 }),
};

export async function optimizeImageBuffer(buffer, mimeType) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new TypeError("An image buffer is required.");
  }
  const encode = Object.hasOwn(encoders, mimeType) ? encoders[mimeType] : undefined;
  if (!encode) throw new TypeError("Unsupported image MIME type.");

  const optimized = await encode(sharp(buffer).rotate()).toBuffer();
  return optimized.length < buffer.length ? optimized : buffer;
}
