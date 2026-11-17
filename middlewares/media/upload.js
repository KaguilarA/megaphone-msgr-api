import multer from "multer";

const MAX_MEDIA_BYTES = 16 * 1024 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/3gpp"]);

const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MEDIA_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (IMAGE_TYPES.has(file.mimetype) || VIDEO_TYPES.has(file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(Object.assign(new Error("Solo se permiten imágenes JPEG, PNG o WebP y videos MP4 o 3GP."), { status: 400 }));
  },
});

export default mediaUpload;
export { MAX_IMAGE_BYTES, MAX_MEDIA_BYTES, IMAGE_TYPES };
