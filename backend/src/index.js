require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Initialiser Redis au démarrage
require("./lib/redis");

const authRoutes = require("./routes/auth");
const settingsRoutes = require("./routes/settings");
const packsRoutes = require("./routes/packs");
const categoriesRoutes = require("./routes/categories");
const galleryRoutes = require("./routes/gallery");
const bookingsRoutes = require("./routes/bookings");
const reviewsRoutes = require("./routes/reviews");
const uploadsRoutes = require("./routes/uploads");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 4000;

const { resolveUploadFile, loadCloudinaryIndex, migrateLocalAssetUrls, isConfigured } = require("./lib/cloudinary");
const { prisma } = require("./lib/prisma");
const { notify } = require("./lib/realtime");
const { redis } = require("./lib/redis");

const uploadDir = path.join(__dirname, "..", process.env.UPLOAD_DIR || "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limite de 1000 requêtes par fenêtre
  message: "Trop de requêtes, réessayez plus tard.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Sécurité et compression
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Désactivé pour le développement
}));
app.use(compression());
app.use(limiter);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()) || true,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/uploads/:filename", async (req, res, next) => {
  const filename = path.basename(req.params.filename || "");
  if (!filename) return res.status(400).json({ error: "Fichier invalide" });

  const localPath = path.join(uploadDir, filename);
  if (fs.existsSync(localPath)) {
    return res.sendFile(localPath);
  }

  try {
    const remote = await resolveUploadFile(filename);
    if (remote) {
      res.set("Cache-Control", "public, max-age=300");
      return res.redirect(302, remote);
    }
  } catch (err) {
    console.error("Resolve upload error:", err.message);
  }

  return next();
});

app.use("/uploads", express.static(uploadDir, {
  maxAge: "1h",
  etag: true,
  lastModified: true,
}));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "artstudio242-api",
    cloudinary: isConfigured(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/packs", packsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/events", require("./routes/events"));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Erreur serveur" });
});

app.listen(PORT, async () => {
  console.log(`Art Studio 242 API → http://localhost:${PORT}`);
  if (isConfigured()) {
    try {
      await loadCloudinaryIndex();
      const result = await migrateLocalAssetUrls(prisma, {
        notify,
        invalidate: (pattern) => redis.invalidatePattern(pattern),
      });
      console.log("Cloudinary migrate:", result);
    } catch (err) {
      console.error("Cloudinary migrate error:", err.message);
    }
  } else {
    console.warn("Cloudinary n'est pas configuré — les uploads locaux seront perdus sur Render.");
  }
});
