// Service Worker "kill switch".
//
// L'ancien Service Worker personnalisé de ce site a causé plusieurs pannes
// de production (réponses invalides, chunks JS obsolètes après déploiement).
// Il a été désactivé : le site ne l'enregistre plus.
//
// Ce fichier reste uniquement au cas où un navigateur essaierait encore de
// l'enregistrer via une ancienne page mise en cache. Dans ce cas, il se
// désinstalle immédiatement lui-même et vide tous les caches, puis laisse
// le navigateur fonctionner normalement (réseau direct, sans interception).
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch {
        /* ignore */
      }
      try {
        await self.registration.unregister();
      } catch {
        /* ignore */
      }
      const clientsList = await self.clients.matchAll({ type: "window" });
      clientsList.forEach((client) => client.navigate(client.url));
    })()
  );
});
