# Art Studio 242 — Plateforme numérique

Studio photo à Brazzaville : site vitrine + réservation + admin CMS paramétrable.

## Architecture

| Couche | Techno | Hébergement |
|--------|--------|-------------|
| Frontend | Next.js (React) | **Vercel** |
| API | Node.js + Express | **Render** |
| Base de données | PostgreSQL + Prisma | **Neon** |

```
ArtStudio242/
├── web/          # Site client + dashboard admin (Vercel)
├── backend/      # API REST (Render)
├── api/          # Ancien dossier (ignoré — utiliser backend/)
└── index_4.html  # Maquette design d’origine
```

## Fonctionnalités

### Côté client
- Landing premium (identité visuelle Art Studio 242)
- Packs dynamiques, galerie filtrable, avis
- Réservation en ligne + lien WhatsApp
- Contenu piloté par l’admin (logo, textes, photos…)

### Côté admin (`/admin`)
- Login JWT
- Dashboard (stats)
- Gestion réservations, packs, catégories, galerie, avis
- Paramètres marque / contact / SEO / promo
- Upload d’images (logo, couvertures, galerie)

## Démarrage local

### 1. Base Neon
1. Créer un projet sur [neon.tech](https://neon.tech)
2. Copier la connection string

```bash
cd backend
cp .env.example .env
# Éditer DATABASE_URL avec l’URL Neon
```

### 2. API

```bash
cd backend
npm install
npm run db:setup
npm run dev
```

API → `http://localhost:4000`  
Admin seed : `admin@artstudio242.com` / `ArtStudio242!`

### 3. Web

```bash
cd web
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev
```

Site → `http://localhost:3000`  
Admin → `http://localhost:3000/admin/login`

## Mise en production

### Neon
- Créer la DB, récupérer `DATABASE_URL` (sslmode=require)

### Render (API)
1. New Web Service → dossier `backend`
2. Build : `npm install && npx prisma generate`
3. Start : `npx prisma db push && node prisma/seed.js && npm start`
4. Variables :
   - `DATABASE_URL`
   - `JWT_SECRET` (long et aléatoire)
   - `CORS_ORIGIN` = URL Vercel (ex. `https://artstudio242.vercel.app`)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD`

### Vercel (Web)
1. Import du repo, **Root Directory** = `web`
2. Variable : `NEXT_PUBLIC_API_URL` = URL Render (ex. `https://artstudio242-api.onrender.com`)

## Identité visuelle

Reprise de la maquette HTML :
- Papier `#f5efe1`, encre `#1c1814`
- Vert / or / rouge (drapeau congolais)
- Fonts : Anton, Caveat, Manrope
