// Moventra Service Worker — Offline Support
const CACHE_NAME = "moventra-v1";
const STATIC_ASSETS = [
  "/",
  "/admin",
  "/moventra-access",
  "/images/logo.png",
  "/manifest.json",
];

// Install — cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy: Network first, cache fallback
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip API calls — always network for data freshness
  if (url.pathname.startsWith("/api/")) return;

  // Skip non-GET
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // Cache successful responses
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() =>
        // Offline: serve from cache
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Offline fallback page
          if (event.request.destination === "document") {
            return new Response(
              `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Moventra — Offline</title>
              <style>body{font-family:Arial;background:#0a1628;color:white;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}
              h1{color:#e67e22}p{color:#9ca3af}.retry{margin-top:20px;padding:12px 24px;background:#e67e22;border:none;color:white;border-radius:12px;cursor:pointer;font-size:14px}</style>
              </head><body>
              <div><h1>📡 You&apos;re offline</h1><p>Moventra requires an internet connection for live data.</p>
              <p style="font-size:12px;margin-top:8px">Your last-viewed pages may still be accessible.</p>
              <button class="retry" onclick="window.location.reload()">Try Again</button></div>
              </body></html>`,
              { headers: { "Content-Type": "text/html" } }
            );
          }
          return new Response("", { status: 503 });
        })
      )
  );
});

// Background sync for failed API calls
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-bookings") {
    console.log("Background sync: bookings");
  }
});
