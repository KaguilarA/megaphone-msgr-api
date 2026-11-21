import multer from "multer";

const MAX_MEDIA_BYTES = 16 * 1024 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_COUNT = 10;
const MAX_VIDEO_COUNT = 1;
const MAX_TOTAL_MEDIA_BYTES = 50 * 1024 * 1024;
const MAX_MEDIA_FILES = MAX_IMAGE_COUNT + MAX_VIDEO_COUNT;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/3gpp"]);

const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MEDIA_BYTES, files: MAX_MEDIA_FILES },
  fileFilter: (_req, file, callback) => {
    if (IMAGE_TYPES.has(file.mimetype) || VIDEO_TYPES.has(file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(Object.assign(new Error("Solo se permiten imágenes JPEG, PNG o WebP y videos MP4 o 3GP."), { status: 400 }));
  },
});

export default mediaUpload;
export {
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_COUNT,
  MAX_MEDIA_BYTES,
  MAX_MEDIA_FILES,
  MAX_TOTAL_MEDIA_BYTES,
  MAX_VIDEO_COUNT,
};
