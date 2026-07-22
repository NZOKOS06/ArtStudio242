const express = require("express");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/stats", requireAuth, async (_req, res) => {
  try {
    const [bookings, pending, reviews, pendingReviews, packs, images] =
      await Promise.all([
        prisma.booking.count(),
        prisma.booking.count({ where: { status: "PENDING" } }),
        prisma.review.count({ where: { isApproved: true } }),
        prisma.review.count({ where: { isApproved: false } }),
        prisma.pack.count({ where: { isActive: true } }),
        prisma.galleryImage.count({ where: { isActive: true } }),
      ]);

    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      bookings,
      pending,
      reviews,
      pendingReviews,
      packs,
      images,
      recentBookings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
