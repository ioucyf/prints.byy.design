const CACHE_NAME = 'cache-__BUILD_SHA__';
const ASSETS = __ASSETS__;
const OWNER = 'ioucyf'; // GitHub username or org
const REPO = 'prints.byy.design';     // Your repo name
const BRANCH = 'main';



async function getCurrentCacheName() {
  const keys = await caches.keys();
  const cacheKey = keys.find(k => k.startsWith(CACHE_NAME));
  return cacheKey || null;
};

async function cacheAllAssets(event) {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(ASSETS.map(asset => {
    return asset.replace(/^[/]/, '');
  }));
  self.skipWaiting();
}

async function cacheAllAssetsIndividually(event) {
  const cache = await caches.open(CACHE_NAME);
  for (const asset of ASSETS) {
    try {
      await cache.add(asset);
      console.log(`[SW] Cached: ${asset}`);
    } catch (err) {
      console.warn(`[SW] Failed to cache: ${asset}`, err);
    }
  }
  self.skipWaiting();
}



async function deleteOldCaches(event) {
  const keys = await caches.keys();
  await Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)));
  self.clients.claim();
}

async function deleteThenUpdate(event) {
  await deleteOldCaches(event);
  await cacheAllAssets(event);
}


async function handleUpdate(event) {
  const currentCache = await getCurrentCacheName();
  if (currentCache) return;


  const keys = await caches.keys();
  for (const key of keys) {
    if (key !== CACHE_NAME) {
      await caches.delete(key);
      console.log('[SW] Deleted old cache:', key);
    }
  }

  const newCache = await caches.open(CACHE_NAME);
  await newCache.addAll(ASSETS);
  console.log('[SW] New cache created:', CACHE_NAME);


  self.skipWaiting();
  // const clients = await self.clients.matchAll();
  // for (const client of clients) {
  //   client.postMessage('reload');
  // }
}

async function cacheFirst(event) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(event.request);
  if (cachedResponse) {
    console.log('[SW] Serving from cache:', event.request.url);
    return cachedResponse;
  }

  console.log('[SW] Fetching from network:', event.request.url);
  const networkResponse = await fetch(event.request);
  if (networkResponse && networkResponse.ok) {
    await cache.put(event.request, networkResponse.clone());
    console.log('[SW] Cached new response:', event.request.url);
  }
  return networkResponse;
}


// SERVICE WORKER EVENTS HANDLERS

self.addEventListener('install', event => {
  event.waitUntil(
    // cacheAllAssets(event)
    // deleteThenUpdate(event)
    handleUpdate(event)
  );
});

self.addEventListener('activate', event => {
  // event.waitUntil(
  // deleteOldCaches(event)
  // deleteThenUpdate(event)
  // );
  self.clients.claim();
});

// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.match(event.request).then(response => response || fetch(event.request))
//   );
// });

self.addEventListener('fetch', event => {
  console.log('[SW] Fetch intercepted:', event.request.url);

 event.respondWith(event.waitUntil(cacheFirst(event)));
});

// ð Listen for 'update' request from page
self.addEventListener('message', event => {
  if (event.data === 'check-for-update') {
    handleUpdate(event);
  }
});
