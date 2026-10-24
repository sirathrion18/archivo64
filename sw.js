// Archivo 64 — guarda la app para que abra rápido y funcione sin conexión.
const CACHE = "a64-v6";
const CORE = ["./","./index.html","./css/app.css","./js/chess.js","./js/content.js","./js/board.js","./js/engine.js","./js/analysis.js","./js/core.js","./js/play.js","./js/learn.js","./js/review.js","./js/home.js","./js/ach.js","./js/games.js","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./engine/stockfish.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.hostname.endsWith("lichess.org") || url.hostname.endsWith("lichess.ovh")) return;
  e.respondWith(
    fetch(e.request).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
