const express = require("express");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function settingsToObject(rows) {
  return rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

router.get("/", async (_req, res) => {
  try {
    const rows = await prisma.setting.findMany();
    res.json(settingsToObject(rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/", requireAuth, async (req, res) => {
  try {
    const payload = req.body || {};
    const entries = Object.entries(payload);

    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value: String(value ?? "") },
          create: { key, value: String(value ?? "") },
        })
      )
    );

    const rows = await prisma.setting.findMany();
    res.json(settingsToObject(rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
