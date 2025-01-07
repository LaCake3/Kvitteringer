const cacheName = "pdf-generator-V1.9.9.3"; // Skift cache-navn ved nye versioner
const staticAssets = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./icon-192x192.png",
    "./icon-512x512.png"
];

// Installér service worker og cache ressourcer
self.addEventListener("install", async (event) => {
    const cache = await caches.open(cacheName);
    await cache.addAll(staticAssets);
    console.log("Service worker installeret, ressourcer cachet.");
});

// Aktiver service worker og ryd gamle caches
self.addEventListener("activate", async (event) => {
    const cacheKeys = await caches.keys();
    await Promise.all(
        cacheKeys
            .filter((key) => key !== cacheName) // Behold kun den nye cache
            .map((key) => caches.delete(key))  // Slet gamle caches
    );
    console.log("Service worker aktiveret, gamle caches ryddet.");
});

// Håndter fetch-anmodninger
self.addEventListener("fetch", (event) => {
    const request = event.request;
    event.respondWith(cacheFirst(request));
});
