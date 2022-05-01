const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = 'data-cache-' + VERSION;
const FILES_TO_CACHE = [
    "/",
    "./index.html",
    "./manifest.json",
    "./css/styles.css",
    "./icons/icon-72x72.png",
    "./icons/icon-96x96.png",
    "./icons/icon-128x128.png",
    "./icons/icon-144x144.png",
    "./icons/icon-152x152.png",
    "./icons/icon-192x192.png",
    "./icons/icon-384x384.png",
    "./icons/icon-512x512.png",
    "./js/index.js",
    "./js/idb.js"
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE)
        })
    )
});

self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    if (e.request.url.includes('/api/')) {
        e.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(e.request).then(res => {
                    if (res.status === 200) {
                        cache.put(e.request.url, res.clone());
                    }
                    return res
                }).catch(() => {
                    return cache.match(e.request)
                })
            }).catch(err => console.log(err))
        );
        return;
    }

    e.respondWith(
        fetch(e.request).catch(function () {
            return caches.match(e.request).then(function (res) {
                if (res) {
                    return res
                } else if (e.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/')
                }
            })
        })
    )


});

// deletes outdated caches 
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function(keyList) {
            let cacheKeepList = keyList.filter(function(key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeepList.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function(key, i) {
                    if (cacheKeepList.indexOf(key) === -1) {
                        console.log('deleting cache : ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});