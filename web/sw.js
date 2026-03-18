var CACHE_NAME = "capuru-v1";
var ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/detail.html",
  "/ranking.html",
  "/mypage.html",
  "/mylist.html",
  "/article.html",
  "/curator.html",
  "/css/style.css",
  "/js/app.js",
  "/js/data.js",
  "/js/track.js",
  "/js/mylist.js",
  "/js/detail.js",
  "/js/ranking.js",
  "/js/bottom-nav.js",
  "/js/capacitor-bridge.js",
  "/js/onboarding.js",
  "/manifest.json"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names
          .filter(function (name) { return name !== CACHE_NAME; })
          .map(function (name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        if (response && response.status === 200 && response.type === "basic") {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(function () {
        return caches.match(event.request);
      })
  );
});
