const OWNER = 'ioucyf'; // GitHub username or org
const REPO = 'prints.byy.design';     // Your repo name
const BRANCH = 'main';
const ASSETS = [
  '/', // adjust if your HTML is not served at root
  '/css/reset.css',
  '/css/global.css',
  '/css/main.css',
  '/css/temp.css',
  '/js/main.js',
  '/assets/icon-1024.png',
  '/manifest.json',
  // add all assets you want cached
];

const getLatestSHA = async () => {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/commits/${BRANCH}`);
  const data = await res.json();
  return data.sha.slice(0, 7); // short SHA for cache name
};

const getCurrentCacheName = async () => {
  const keys = await caches.keys();
  const cacheKey = keys.find(k => k.startsWith('cache-'));
  return cacheKey || null;
};

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const sha = await getLatestSHA();
      const cacheName = `cache-${sha}`;
      const cache = await caches.open(cacheName);
      await cache.addAll(ASSETS);
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const latestSHA = await getLatestSHA();
      const keep = `cache-${latestSHA}`;
      const keys = await caches.keys();
      await Promise.all(keys.map(k => (k !== keep ? caches.delete(k) : null)));
      self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// 🔁 Listen for 'update' request from page
self.addEventListener('message', event => {
  if (event.data === 'check-for-update') {
    handleUpdate(event);
  }
});

async function handleUpdate(event) {
  const latestSHA = await getLatestSHA();
  const currentCache = await getCurrentCacheName();
  const currentSHA = currentCache?.replace('cache-', '');

  if (currentSHA !== latestSHA) {
    const newCache = await caches.open(`cache-${latestSHA}`);
    await newCache.addAll(ASSETS);

    // Delete old cache
    const keys = await caches.keys();
    for (const key of keys) {
      if (key !== `cache-${latestSHA}`) await caches.delete(key);
    }

    // Notify the client to reload
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage('reload');
    }
  } else {
    // Already up to date
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage('no-update');
    }
  }
}