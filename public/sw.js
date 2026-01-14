// Service Worker for Background Playback
const CACHE_NAME = "yt-music-player-v1";
const urlsToCache = ["/", "/manifest.json"];

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    })
  );
});

// Background sync for playback state
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-playback-state") {
    event.waitUntil(syncPlaybackState());
  }
});

async function syncPlaybackState() {
  // This will be called when the device comes back online
  // You can sync playback state here if needed
  return Promise.resolve();
}

// Handle background fetch for audio (if needed in future)
self.addEventListener("backgroundfetch", (event) => {
  // Handle background audio fetching
});
