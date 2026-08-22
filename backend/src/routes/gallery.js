const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { notify } = require("../lib/realtime");
const { redis } = require("../lib/redis");
const { 
  imageCacheMiddleware, 
  createCacheInvalidator 
} = require("../middleware/cache");
const { rewriteGalleryImagesAsync } = require("../lib/cloudinary");

const router = express.Router();

const imageSchema = z.object({
  title: z.string().optional().nullable(),
  imageUrl: z.string().min(1),
  alt: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  categoryId: z.string().optional().nullable(),
});

// Route GET avec cache Redis optimisé
router.get("/", imageCacheMiddleware, async (req, res) => {
  try {
    const all = req.query.all === "1";
    const featured = req.query.featured === "1";
    const category = req.query.category;

    // Clé de cache spécifique avec paramètres
    const cacheKey = `gallery:${all}:${featured}:${category || 'none'}`;
    
    // Essayer de récupérer depuis Redis avec fallback
    const raw = await redis.getOrSet(cacheKey, async () => {
      const where = {};
      if (!all) where.isActive = true;
      if (featured) where.isFeatured = true;
      if (category) {
        where.category = { slug: category };
      }

      return await prisma.galleryImage.findMany({
        where,
        orderBy: { sortOrder: "asc" },
        include: { 
          category: {
            select: { id: true, name: true, slug: true }
          } 
        },
      });
    }, 3600);

    const images = await rewriteGalleryImagesAsync(raw, prisma);
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST avec invalidation de cache
router.post("/", requireAuth, createCacheInvalidator(['gallery:*', 'images:*']), async (req, res) => {
  try {
    const data = imageSchema.parse(req.body);
    const image = await prisma.galleryImage.create({ data });
    notify("gallery", "create");
    res.status(201).json(image);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Données invalides", details: err.errors });
    }
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT avec invalidation de cache
router.put("/:id", requireAuth, createCacheInvalidator(['gallery:*', 'images:*']), async (req, res) => {
  try {
    const data = imageSchema.partial().parse(req.body);
    const image = await prisma.galleryImage.update({
      where: { id: req.params.id },
      data,
    });
    notify("gallery", "update");
    res.json(image);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Données invalides", details: err.errors });
    }
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE avec invalidation de cache
router.delete("/:id", requireAuth, createCacheInvalidator(['gallery:*', 'images:*']), async (req, res) => {
  try {
    await prisma.galleryImage.delete({ where: { id: req.params.id } });
    notify("gallery", "delete");
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
