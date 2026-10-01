import multer from "multer";

const MAX_MEDIA_BYTES = 16 * 1024 * 1024;

const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MEDIA_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (/^(image|video)\//.test(file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(new Error("Only image and video files are supported."));
  },
});

export default mediaUpload;
export { MAX_MEDIA_BYTES };
