const CACHE_NAME = 'cache-$SHA';
const ASSETS = $ASSET_LIST; // placeholder to be replaced with JSON array
const OWNER = 'ioucyf'; // GitHub username or org
const REPO = 'prints.byy.design';     // Your repo name
const BRANCH = 'main';



async function getCurrentCacheName() {
  const keys = await caches.keys();
  const cacheKey = keys.find(k => k.startsWith('cache-'));
  return cacheKey || null;
};

async function cacheAllAssets(event) {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(ASSETS);
  self.skipWaiting();
}

async function deleteOldCaches(event) {
  const keys = await caches.keys();
  await Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)));
  self.clients.claim();
}


async function handleUpdate(event) {
  const currentCache = await getCurrentCacheName();
  const currentSHA = currentCache?.replace('cache-', '');

  if (currentSHA !== '__BUILD_SHA__') {

    if (currentCache) {
      await caches.delete(currentCache);
    }

    const newCache = await caches.open(CACHE_NAME);
    await newCache.addAll(ASSETS);

    const keys = await caches.keys();
    for (const key of keys) {
      if (key !== CACHE_NAME) await caches.delete(key);
    }

    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage('reload');
    }
  } else {
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage('no-update');
    }
  }
}




// SERVICE WORKER EVENTS HANDLERS

self.addEventListener('install', event => {
  event.waitUntil(
    cacheAllAssets(event)
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    deleteOldCaches(event)
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// ð Listen for 'update' request from page
self.addEventListener('message', event => {
  if (event.data === 'check-for-update') {
    handleUpdate(event);
  }
});
