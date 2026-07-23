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
- Sync live (SSE) des changements admin → site

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

Ordre recommandé : **Neon → Render (API) → Vercel (web) → recoller CORS**.

### 1. Neon
- Projet PostgreSQL, `DATABASE_URL` avec `sslmode=require`
- Ne jamais committer cette URL

### 2. Render (API)
1. Connecter le repo GitHub, **Root Directory** = `backend`  
   (ou Blueprint [`render.yaml`](render.yaml) à la racine)
2. Build : `npm install && npx prisma generate`
3. Start : `npx prisma db push && node prisma/seed.js && npm start`
4. Health check : `/health`
5. Variables d’environnement :
   - `DATABASE_URL` — Neon
   - `JWT_SECRET` — long et aléatoire (généré par Render si Blueprint)
   - `CORS_ORIGIN` — URL Vercel (ex. `https://artstudio242.vercel.app`)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME`
6. Noter l’URL publique : `https://….onrender.com`

Le seed est **idempotent** : il ne réécrit pas packs / catégories / settings déjà présents.

**Uploads** : sur le plan free Render, les fichiers dans `/uploads` sont éphémères (perdus au redéploy). Les images Unsplash du seed restent OK.

### 3. Vercel (Web)
1. Import du repo, **Root Directory** = `web`
2. Variable : `NEXT_PUBLIC_API_URL` = URL Render (ex. `https://artstudio242-api.onrender.com`)
3. Déployer, noter l’URL `https://….vercel.app`

### 4. Finaliser CORS
Sur Render, mettre `CORS_ORIGIN` = URL Vercel exacte (plusieurs origines possibles, séparées par des virgules), puis redéployer l’API si besoin.

### 5. Smoke test
- `GET /health` sur l’API
- Accueil du site
- Login admin + enregistrement paramètres
- Vérifier la sync live (si le service Render n’est pas en sleep)

### Limites plan free
- Cold start Render (~30–60 s) au premier hit
- SSE indisponible pendant le sleep
- Uploads non persistants sans disque payant / stockage cloud

## PWA

Le site est installable :
- `web/public/manifest.webmanifest`
- `web/public/sw.js` (actif en production)
- Icônes dans `web/public/icons/`

Sur mobile (Chrome/Safari) : « Ajouter à l’écran d’accueil ».

## Identité visuelle

Reprise de la maquette HTML :
- Papier `#f5efe1`, encre `#1c1814`
- Vert / or / rouge (drapeau congolais)
- Fonts : Anton, Caveat, Manrope
