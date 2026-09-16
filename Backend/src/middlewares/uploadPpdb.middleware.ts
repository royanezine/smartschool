import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(
  process.cwd(),
  "uploads",
  "ppdb"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const ext = path.extname(
      file.originalname
    );

    const name =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${ext}`;

    cb(null, name);
  },
});

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb
) => {
  const allowed = [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];

  if (!allowed.includes(file.mimetype)) {
    return cb(
      new Error(
        "Format file harus PDF, JPG, atau PNG"
      )
    );
  }

  cb(null, true);
};

export const uploadPpdb =
  multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });