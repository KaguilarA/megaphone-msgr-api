import tinify from "tinify";

export async function compressImageBuffer(buffer, apiKey) {
  if (!apiKey) {
    throw new Error("TINYPNG_API_KEY is required to upload images.");
  }
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new TypeError("An image buffer is required for TinyPNG compression.");
  }

  tinify.key = apiKey;
  return tinify.fromBuffer(buffer).toBuffer();
}
