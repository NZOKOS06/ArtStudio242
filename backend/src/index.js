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

// Servir les fichiers statiques avec cache optimisé
app.use("/uploads", express.static(uploadDir, {
  maxAge: '1y', // Cache 1 an
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.includes('/uploads/')) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "artstudio242-api" });
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

app.listen(PORT, () => {
  console.log(`Art Studio 242 API → http://localhost:${PORT}`);
});
