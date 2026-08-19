# Plan de Refonte Totale (Tailwind CSS, GSAP, Lenis)

Ce plan détaille la restructuration profonde du projet pour adopter les meilleures technologies modernes d'interface et d'animation, et correspondre exactement à l'expérience "premium" de vos maquettes.

## User Review Required

> [!WARNING]
> Comme demandé, cette approche "casse et reconstruit" va modifier la majorité des fichiers du projet. Les fichiers CSS natifs seront supprimés au profit de Tailwind CSS, et les fichiers `.js` seront renommés en `.jsx`.

## Open Questions

> [!IMPORTANT]
> 1. L'intégration de GSAP et Lenis ajoutera des animations de défilement très fluides, mais peut légèrement impacter les performances sur les très vieux téléphones. Êtes-vous d'accord pour privilégier l'expérience premium (animations) ?
> 2. Pour le panneau d'administration, souhaitez-vous également le thème sombre avec Tailwind, ou un thème clair plus classique pour la gestion ?

## Proposed Changes

---

### 1. Configuration des Dépendances
- Installation de **Tailwind CSS** (`tailwindcss`, `postcss`, `autoprefixer`).
- Installation de **GSAP** (pour les animations complexes et le ScrollTrigger).
- Installation de **Lenis** (`@studio-freight/lenis` / `lenis`) pour le "smooth scrolling".

### 2. Restructuration et Fichiers JSX
Renommer tous les fichiers `.js` contenant du React en `.jsx` pour respecter les conventions modernes.

#### [NEW] [tailwind.config.mjs](file:///d:/cours/ArtStudio242/web/tailwind.config.mjs)
- Configuration complète de Tailwind avec les couleurs du thème (fond noir, accents rouges).

#### [MODIFY] [globals.css](file:///d:/cours/ArtStudio242/web/src/app/globals.css)
- Remplacement du CSS natif par les directives `@tailwind base; @tailwind components; @tailwind utilities;`.

#### [DELETE] [site.module.css](file:///d:/cours/ArtStudio242/web/src/app/site.module.css)
- Suppression des modules CSS devenus inutiles.

---

### 3. Intégration du Smooth Scroll (Lenis)

#### [NEW] [SmoothScroll.jsx](file:///d:/cours/ArtStudio242/web/src/components/SmoothScroll.jsx)
- Création d'un composant enveloppe (wrapper) qui initialise Lenis et GSAP pour synchroniser le défilement fluide sur toute l'application.

#### [MODIFY] [layout.jsx](file:///d:/cours/ArtStudio242/web/src/app/layout.js) (sera renommé)
- Envelopper l'application avec le composant `SmoothScroll`.

---

### 4. Refonte des Composants Frontend (Tailwind + GSAP)

#### [MODIFY] [HomeClient.jsx](file:///d:/cours/ArtStudio242/web/src/components/HomeClient.js)
- Traduction complète de l'interface en classes Tailwind.
- Ajout de `useGSAP` (ou `useEffect`) pour animer l'apparition du texte "L'image n'est pas seulement prise. Elle est créée." et les éléments au défilement (ScrollTrigger).

#### [MODIFY] [ReserverForm.jsx](file:///d:/cours/ArtStudio242/web/src/app/reserver/ReserverForm.js)
- Réécriture du formulaire de réservation avec des bordures subtiles, des effets de survol fluides et des grilles Tailwind.

#### [MODIFY] [SiteHeader.jsx](file:///d:/cours/ArtStudio242/web/src/components/SiteHeader.js) & [SiteFooter.jsx](file:///d:/cours/ArtStudio242/web/src/components/SiteFooter.js)
- Menu de navigation refait avec Tailwind, effet glassmorphism (backdrop-blur) optimisé.

---

### 5. Refonte de l'Administration

#### [MODIFY] [AdminShell.jsx](file:///d:/cours/ArtStudio242/web/src/components/AdminShell.js) et pages `/admin/*`
- Destruction du CSS actuel de l'admin et reconstruction complète avec Tailwind CSS pour une interface d'administration ultra-propre, moderne et réactive.

## Verification Plan

### Manual Verification
1. Lancer le frontend (`npm run dev`) pour compiler le nouveau Tailwind CSS.
2. Vérifier que la page d'accueil possède un défilement ultra-fluide (Lenis).
3. S'assurer que les éléments apparaissent avec des animations GSAP lors du défilement.
4. Parcourir toutes les pages (Client et Admin) pour garantir l'absence de CSS résiduel et la perfection du rendu Tailwind.
