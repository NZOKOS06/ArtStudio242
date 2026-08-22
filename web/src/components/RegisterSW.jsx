"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    let reloaded = false;

    // `updateViaCache: "none"` force le navigateur à toujours vérifier le
    // réseau pour sw.js (jamais le cache HTTP), pour que tout correctif
    // atteigne les visiteurs dès leur prochaine visite, pas des heures plus tard.
    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((registration) => {
        // Vérifie immédiatement s'il existe une version plus récente du SW.
        registration.update().catch(() => {});

        // Si un nouveau SW prend le contrôle (après skipWaiting), on recharge
        // une seule fois pour que la page utilise la version corrigée.
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (reloaded) return;
          reloaded = true;
          window.location.reload();
        });
      })
      .catch(() => {
        /* ignore */
      });
  }, []);

  return null;
}
