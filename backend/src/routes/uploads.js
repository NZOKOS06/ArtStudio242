const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function parseCloudinaryUrl(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== "cloudinary:") return null;
    return {
      cloud_name: u.hostname,
      api_key: decodeURIComponent(u.username),
      api_secret: decodeURIComponent(u.password),
    };
  } catch {
    return null;
  }
}

const fromUrl = process.env.CLOUDINARY_URL
  ? parseCloudinaryUrl(process.env.CLOUDINARY_URL)
  : null;

const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME || fromUrl?.cloud_name || "";
const apiKey = process.env.CLOUDINARY_API_KEY || fromUrl?.api_key || "";
const apiSecret =
  process.env.CLOUDINARY_API_SECRET || fromUrl?.api_secret || "";

const hasCloudinary = Boolean(cloudName && apiKey && apiSecret);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

const uploadDir = path.join(
  __dirname,
  "..",
  "..",
  process.env.UPLOAD_DIR || "uploads"
);

if (!hasCloudinary && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: hasCloudinary
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => {
          const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
          cb(null, `${Date.now()}-${safe}`);
        },
      }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Seules les images sont acceptées"));
    }
    cb(null, true);
  },
});

function uploadToCloudinary(buffer, originalname) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "artstudio242",
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
        filename_override: originalname,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

router.post("/", requireAuth, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier" });
    }

    if (hasCloudinary) {
      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      return res.status(201).json({
        url: result.secure_url,
        publicId: result.public_id,
        filename: result.original_filename || req.file.originalname,
      });
    }

    const url = `/uploads/${req.file.filename}`;
    return res.status(201).json({ url, filename: req.file.filename });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
