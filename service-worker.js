const cacheName = "pdf-generator-v11.2"; // Skift cache-navn ved nye versioner
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

// Brug cache først og hent fra netværk som fallback
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || fetch(request);
}
