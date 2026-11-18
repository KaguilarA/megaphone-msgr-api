import { v2 as cloudinary } from "cloudinary";
import type { CloudinaryConfig } from "../types/domain.js";

export function uploadImageBuffer(
  buffer: Buffer,
  { cloudName, apiKey, apiSecret }: CloudinaryConfig = {},
) {
  if (!cloudName || !apiKey || !apiSecret) {
    throw Object.assign(
      new Error("La carga de imágenes requiere CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET."),
      { status: 503 },
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(buffer);
  });
}
