import { optimizeImageBuffer } from "./imageOptimization.js";

const mediaFileExtensions = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["video/mp4", "mp4"],
  ["video/3gpp", "3gp"],
]);

export async function prepareWhatsAppMedia(file) {
  const extension = mediaFileExtensions.get(file?.mimetype);
  if (!extension || !Buffer.isBuffer(file?.buffer) || !file.buffer.length) {
    throw new TypeError("The attachment could not be prepared for WhatsApp.");
  }

  const isImage = file.mimetype.startsWith("image/");
  const buffer = isImage
    ? await optimizeImageBuffer(file.buffer, file.mimetype)
    : file.buffer;

  return {
    type: isImage ? "image" : "video",
    data: buffer.toString("base64"),
    filename: `attachment.${extension}`,
    mimeType: file.mimetype,
    bytes: buffer.length,
  };
}
