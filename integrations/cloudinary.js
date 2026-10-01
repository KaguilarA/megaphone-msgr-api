import { v2 as cloudinary } from "cloudinary";

export function configureCloudinary({ cloudName, apiKey, apiSecret } = {}) {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

export function uploadMediaBuffer(
  buffer,
  { cloudName, apiKey, apiSecret, folder } = {},
) {
  const client = configureCloudinary({ cloudName, apiKey, apiSecret });

  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    );

    stream.end(buffer);
  });
}
