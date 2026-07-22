const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

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

router.get("/", async (req, res) => {
  try {
    const all = req.query.all === "1";
    const featured = req.query.featured === "1";
    const category = req.query.category;

    const where = {};
    if (!all) where.isActive = true;
    if (featured) where.isFeatured = true;
    if (category) {
      where.category = { slug: category };
    }

    const images = await prisma.galleryImage.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      include: { category: true },
    });
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const data = imageSchema.parse(req.body);
    const image = await prisma.galleryImage.create({ data });
    res.status(201).json(image);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Données invalides", details: err.errors });
    }
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const data = imageSchema.partial().parse(req.body);
    const image = await prisma.galleryImage.update({
      where: { id: req.params.id },
      data,
    });
    res.json(image);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Données invalides", details: err.errors });
    }
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.galleryImage.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
