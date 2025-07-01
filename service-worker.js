let version = null;

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("prints-cache").then(cache => {
      return cache.addAll([
        "./",
        "./assets/",
        "./css/",
        "./js/",
        "./assets/icon-1024.png",
        "./css/reset.css",
        "./css/global.css",
        "./css/main.css",
        "./js/main.js",
        "./index.html",
        "./manifest.json",
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (/version\.json$/gi.test(url.pathname)) {
    return event.respondWith(fetch(event.requets));
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});