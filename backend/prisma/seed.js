require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEFAULT_SETTINGS = {
  brandName: "Art Studio 242",
  tagline: "Capturer • Sublimer • Immortaliser",
  heroEyebrow: "Studio photo — Brazzaville",
  heroTitle: "Capturez vos meilleurs Moments",
  heroSubtitle: "Des souvenirs authentiques, des images éternelles.",
  heroCtaPrimary: "Réserver une séance",
  heroCtaSecondary: "Voir nos packs",
  logoUrl: "",
  phone: "+242 06 916 75 15",
  phoneSecondary: "064223521",
  whatsapp: "242069167515",
  email: "artstudio242@gmail.com",
  instagram: "https://instagram.com/artstudio242",
  facebook: "",
  tiktok: "",
  address: "Brazzaville",
  country: "République du Congo",
  promoBanner: "OFFRE DE LANCEMENT — -20% pour les 10 premiers clients",
  promoActive: "true",
  contactBanner: "Réservez maintenant, places limitées !",
  metaTitle: "Art Studio 242 — Capturez vos meilleurs moments",
  metaDescription:
    "Studio photo professionnel à Brazzaville. Portraits, événements, packs photo. Réservez votre séance en ligne.",
};

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@artstudio242.com";
  const password = process.env.ADMIN_PASSWORD || "ArtStudio242!";
  const name = process.env.ADMIN_NAME || "Art Studio Admin";

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.admin.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { email, name, passwordHash },
  });

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  const packs = [
    {
      name: "Découverte",
      slug: "decouverte",
      description: "Idéal pour découvrir le studio",
      price: 15000,
      duration: "1 heure",
      photoCount: 20,
      features: JSON.stringify(["1 fond", "2 tenues", "1 heure — 20 photos"]),
      color: "green",
      sortOrder: 1,
    },
    {
      name: "Silver",
      slug: "silver",
      description: "Le plus choisi par nos clients",
      price: 30000,
      duration: "2 heures",
      photoCount: 35,
      features: JSON.stringify(["Fonds au choix", "4 tenues", "2 heures — 35 photos"]),
      color: "gold",
      badge: "★ LE PLUS CHOISI",
      isFeatured: true,
      sortOrder: 2,
    },
    {
      name: "Gold",
      slug: "gold",
      description: "Pour une expérience premium",
      price: 60000,
      duration: "3 heures",
      photoCount: 50,
      features: JSON.stringify(["Fonds inclus", "Plus de 4 tenues", "3 heures — 50 photos"]),
      color: "red",
      sortOrder: 3,
    },
    {
      name: "Événement",
      slug: "evenement",
      description: "Dot, mariage et grands moments",
      price: 300000,
      duration: "Sur devis",
      photoCount: null,
      features: JSON.stringify([
        "Dot (mariage coutumier)",
        "Mariage",
        "Autres événements importants",
      ]),
      color: "black",
      sortOrder: 4,
    },
  ];

  for (const pack of packs) {
    await prisma.pack.upsert({
      where: { slug: pack.slug },
      update: pack,
      create: pack,
    });
  }

  const categories = [
    {
      name: "Portrait",
      slug: "portrait",
      description: "Portraits studio & lifestyle",
      coverUrl:
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
      sortOrder: 1,
    },
    {
      name: "Famille",
      slug: "famille",
      description: "Moments en famille",
      coverUrl:
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80",
      sortOrder: 2,
    },
    {
      name: "Événement",
      slug: "evenement",
      description: "Mariages, dots & cérémonies",
      coverUrl:
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      sortOrder: 3,
    },
    {
      name: "Mode",
      slug: "mode",
      description: "Lookbook & éditoriaux",
      coverUrl:
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
      sortOrder: 4,
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  const portrait = await prisma.category.findUnique({ where: { slug: "portrait" } });
  const famille = await prisma.category.findUnique({ where: { slug: "famille" } });
  const evenement = await prisma.category.findUnique({ where: { slug: "evenement" } });
  const mode = await prisma.category.findUnique({ where: { slug: "mode" } });

  const galleryCount = await prisma.galleryImage.count();
  if (galleryCount === 0) {
    const images = [
      {
        title: "Portrait studio",
        imageUrl:
          "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200&q=80",
        categoryId: portrait?.id,
        isFeatured: true,
        sortOrder: 1,
      },
      {
        title: "Élégance",
        imageUrl:
          "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1200&q=80",
        categoryId: portrait?.id,
        isFeatured: true,
        sortOrder: 2,
      },
      {
        title: "Famille",
        imageUrl:
          "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&q=80",
        categoryId: famille?.id,
        isFeatured: true,
        sortOrder: 3,
      },
      {
        title: "Mariage",
        imageUrl:
          "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
        categoryId: evenement?.id,
        isFeatured: true,
        sortOrder: 4,
      },
      {
        title: "Mode",
        imageUrl:
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80",
        categoryId: mode?.id,
        isFeatured: true,
        sortOrder: 5,
      },
      {
        title: "Look",
        imageUrl:
          "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1200&q=80",
        categoryId: mode?.id,
        isFeatured: false,
        sortOrder: 6,
      },
    ];
    await prisma.galleryImage.createMany({ data: images });
  }

  const reviewCount = await prisma.review.count();
  if (reviewCount === 0) {
    await prisma.review.createMany({
      data: [
        {
          authorName: "Aïcha M.",
          rating: 5,
          comment:
            "Une expérience magique ! L’équipe est professionnelle et les photos sont magnifiques.",
          isApproved: true,
          isFeatured: true,
        },
        {
          authorName: "Jean-Paul K.",
          rating: 5,
          comment:
            "Studio au top à Brazzaville. Pack Silver parfait pour notre séance famille.",
          isApproved: true,
          isFeatured: true,
        },
        {
          authorName: "Grace N.",
          rating: 5,
          comment:
            "Ambiance chaleureuse, conseils poses excellents. Je recommande Art Studio 242.",
          isApproved: true,
          isFeatured: true,
        },
      ],
    });
  }

  await prisma.promo.upsert({
    where: { id: "seed-launch-promo" },
    update: {},
    create: {
      id: "seed-launch-promo",
      title: "Offre de lancement",
      description: "-20% pour les 10 premiers clients",
      discountPct: 20,
      isActive: true,
    },
  });

  console.log("Seed OK — admin:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
