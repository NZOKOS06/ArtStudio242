const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { notify } = require("../lib/realtime");

const router = express.Router();

const reviewSchema = z.object({
  authorName: z.string().min(2),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5),
});

router.get("/", async (req, res) => {
  try {
    const all = req.query.all === "1";
    const reviews = await prisma.review.findMany({
      where: all ? undefined : { isApproved: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = reviewSchema.parse(req.body);
    const review = await prisma.review.create({
      data: { ...data, isApproved: false },
    });
    notify("reviews", "create");
    res.status(201).json({
      ...review,
      message: "Merci ! Votre avis sera publié après validation.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Données invalides", details: err.errors });
    }
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const schema = z.object({
      isApproved: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
      comment: z.string().optional(),
      rating: z.number().int().min(1).max(5).optional(),
    });
    const data = schema.parse(req.body);
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data,
    });
    notify("reviews", "update");
    res.json(review);
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
    await prisma.review.delete({ where: { id: req.params.id } });
    notify("reviews", "delete");
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
