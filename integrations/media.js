import { optimizeImageBuffer } from "./imageOptimization.js";
import { uploadImageBuffer } from "./cloudinary.js";

const mediaFileExtensions = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["video/mp4", "mp4"],
  ["video/3gpp", "3gp"],
]);

export async function prepareWhatsAppMedia(
  file,
  cloudinaryConfig,
  uploadImage = uploadImageBuffer,
) {
  const extension = mediaFileExtensions.get(file?.mimetype);
  if (!extension || !Buffer.isBuffer(file?.buffer) || !file.buffer.length) {
    throw new TypeError("The attachment could not be prepared for WhatsApp.");
  }

  const isImage = file.mimetype.startsWith("image/");
  const buffer = isImage
    ? await optimizeImageBuffer(file.buffer, file.mimetype)
    : file.buffer;
  let uploadedImage;
  if (isImage) {
    try {
      uploadedImage = await uploadImage(buffer, cloudinaryConfig);
    } catch (error) {
      if (error.status) throw error;
      throw Object.assign(
        new Error("No se pudo guardar la imagen en Cloudinary. Intenta de nuevo."),
        { status: 503, cause: error },
      );
    }
  }
  if (isImage && typeof uploadedImage?.secure_url !== "string") {
    throw Object.assign(
      new Error("Cloudinary no devolvió la referencia de la imagen."),
      { status: 503 },
    );
  }

  return {
    type: isImage ? "image" : "video",
    data: buffer.toString("base64"),
    filename: `attachment.${extension}`,
    mimeType: file.mimetype,
    bytes: buffer.length,
    ...(uploadedImage ? { mediaUrl: uploadedImage.secure_url } : {}),
  };
}
