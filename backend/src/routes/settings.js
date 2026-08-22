const express = require("express");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { notify } = require("../lib/realtime");
const { rewriteSettingsAsync } = require("../lib/cloudinary");

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
    res.json(await rewriteSettingsAsync(settingsToObject(rows), prisma));
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
    const data = await rewriteSettingsAsync(settingsToObject(rows), prisma);
    notify("settings", "update");
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
