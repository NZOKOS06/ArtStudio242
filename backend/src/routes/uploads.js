const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { requireAuth } = require("../middleware/auth");
const {
  isConfigured,
  isProductionHost,
  uploadBuffer,
  migrateLocalAssetUrls,
  rewriteAssetUrlAsync,
  isLocalUploadUrl,
} = require("../lib/cloudinary");
const { prisma } = require("../lib/prisma");
const { notify } = require("../lib/realtime");
const { redis } = require("../lib/redis");

const router = express.Router();

const uploadDir = path.join(
  __dirname,
  "..",
  "..",
  process.env.UPLOAD_DIR || "uploads"
);

if (!isConfigured() && !isProductionHost() && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: isConfigured()
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

router.post("/", requireAuth, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier" });
    }

    if (!isConfigured()) {
      if (isProductionHost()) {
        return res.status(503).json({
          error:
            "Cloudinary n'est pas configuré. Ajoutez CLOUDINARY_URL (ou CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET) sur Render.",
        });
      }

      const url = `/uploads/${req.file.filename}`;
      return res.status(201).json({ url, filename: req.file.filename, storage: "local" });
    }

    const result = await uploadBuffer(req.file.buffer, req.file.originalname);
    return res.status(201).json({
      url: result.secure_url,
      publicId: result.public_id,
      filename: result.original_filename || req.file.originalname,
      storage: "cloudinary",
    });
  } catch (err) {
    next(err);
  }
});

router.get("/resolve", async (req, res, next) => {
  try {
    const url = req.query.url || "";
    if (!url) {
      return res.status(400).json({ error: "Paramètre url requis" });
    }
    if (!isLocalUploadUrl(url)) {
      return res.json({ url, resolved: url });
    }
    const resolved = await rewriteAssetUrlAsync(url);
    res.json({ url, resolved });
  } catch (err) {
    next(err);
  }
});

router.post("/sync", requireAuth, async (_req, res, next) => {
  try {
    const result = await migrateLocalAssetUrls(prisma, {
      notify,
      invalidate: (pattern) => redis.invalidatePattern(pattern),
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
