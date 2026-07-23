const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { notify } = require("../lib/realtime");

const router = express.Router();

function parsePack(pack) {
  return {
    ...pack,
    features: typeof pack.features === "string" ? JSON.parse(pack.features || "[]") : pack.features,
  };
}

const packSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  price: z.number().int().nonnegative(),
  currency: z.string().optional(),
  duration: z.string().optional().nullable(),
  photoCount: z.number().int().optional().nullable(),
  features: z.array(z.string()).optional(),
  color: z.string().optional(),
  badge: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

router.get("/", async (req, res) => {
  try {
    const all = req.query.all === "1";
    const packs = await prisma.pack.findMany({
      where: all ? undefined : { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    res.json(packs.map(parsePack));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const pack = await prisma.pack.findFirst({
      where: {
        OR: [{ id: req.params.id }, { slug: req.params.id }],
      },
    });
    if (!pack) return res.status(404).json({ error: "Pack introuvable" });
    res.json(parsePack(pack));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const data = packSchema.parse(req.body);
    const slug = data.slug || slugify(data.name);
    const pack = await prisma.pack.create({
      data: {
        ...data,
        slug,
        features: JSON.stringify(data.features || []),
      },
    });
    notify("packs", "create");
    res.status(201).json(parsePack(pack));
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
    const data = packSchema.partial().parse(req.body);
    const update = { ...data };
    if (data.features) update.features = JSON.stringify(data.features);
    const pack = await prisma.pack.update({
      where: { id: req.params.id },
      data: update,
    });
    notify("packs", "update");
    res.json(parsePack(pack));
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
    await prisma.pack.delete({ where: { id: req.params.id } });
    notify("packs", "delete");
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
