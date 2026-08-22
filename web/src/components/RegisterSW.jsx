"use client";

import { useEffect } from "react";

// Le Service Worker personnalisé a causé plusieurs pannes de production
// (réponses invalides, chunks JS mis en cache qui ne correspondent plus au
// build actuel après un déploiement). On le désactive donc complètement :
// chaque visiteur qui a encore l'ancien SW actif dans son navigateur se le
// verra automatiquement désinstallé, sans aucune action de sa part.
// Le cache navigateur/CDN standard (fichiers Next.js versionnés par hash,
// en-têtes Cache-Control) suffit et ne présente pas ce risque.
const RELOAD_FLAG = "as242_sw_cleanup_reload";

async function unregisterServiceWorkersAndCaches() {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }
  } catch {
    /* ignore */
  }

  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {
    /* ignore */
  }
}

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    (async () => {
      if (!("serviceWorker" in navigator)) return;

      const registrations = await navigator.serviceWorker
        .getRegistrations()
        .catch(() => []);

      if (cancelled || registrations.length === 0) return;

      await unregisterServiceWorkersAndCaches();

      // Un seul rechargement automatique, pour repartir avec des fichiers
      // propres — jamais de boucle même si le nettoyage devait se répéter.
      if (!sessionStorage.getItem(RELOAD_FLAG)) {
        sessionStorage.setItem(RELOAD_FLAG, "1");
        window.location.reload();
      }
    })();

    // Filet de sécurité : si un vieux chunk JS mis en cache par une session
    // précédente provoque quand même une erreur (ex. après un déploiement),
    // on nettoie et on recharge une seule fois au lieu de laisser la page
    // cassée à l'écran.
    const isChunkError = (message) =>
      typeof message === "string" &&
      (message.includes("Loading chunk") ||
        message.includes("ChunkLoadError") ||
        message.includes("Cannot read properties of null"));

    const recoverOnce = () => {
      if (sessionStorage.getItem(RELOAD_FLAG)) return;
      sessionStorage.setItem(RELOAD_FLAG, "1");
      unregisterServiceWorkersAndCaches().finally(() => window.location.reload());
    };

    const onError = (event) => {
      if (isChunkError(event?.message)) recoverOnce();
    };
    const onRejection = (event) => {
      if (isChunkError(String(event?.reason?.message || event?.reason || ""))) recoverOnce();
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      cancelled = true;
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
