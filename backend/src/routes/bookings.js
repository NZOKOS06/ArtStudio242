const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { notify } = require("../lib/realtime");

const router = express.Router();

const bookingSchema = z.object({
  clientName: z.string().min(2),
  clientPhone: z.string().min(6),
  clientEmail: z.string().email().optional().nullable().or(z.literal("")),
  packId: z.string().optional().nullable(),
  preferredAt: z.string().datetime().optional().nullable(),
  message: z.string().optional().nullable(),
});

router.post("/", async (req, res) => {
  try {
    const data = bookingSchema.parse(req.body);
    let packName = null;
    if (data.packId) {
      const pack = await prisma.pack.findUnique({ where: { id: data.packId } });
      packName = pack?.name || null;
    }

    const booking = await prisma.booking.create({
      data: {
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        clientEmail: data.clientEmail || null,
        packId: data.packId || null,
        packName,
        preferredAt: data.preferredAt ? new Date(data.preferredAt) : null,
        message: data.message || null,
      },
    });

    notify("bookings", "create");
    res.status(201).json(booking);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Données invalides", details: err.errors });
    }
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const status = req.query.status;
    const bookings = await prisma.booking.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      include: { pack: true },
    });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const schema = z.object({
      status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]).optional(),
      adminNotes: z.string().optional().nullable(),
      preferredAt: z.string().datetime().optional().nullable(),
    });
    const data = schema.parse(req.body);
    const update = { ...data };
    if (data.preferredAt !== undefined) {
      update.preferredAt = data.preferredAt ? new Date(data.preferredAt) : null;
    }
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: update,
    });
    notify("bookings", "update");
    res.json(booking);
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
    await prisma.booking.delete({ where: { id: req.params.id } });
    notify("bookings", "delete");
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
