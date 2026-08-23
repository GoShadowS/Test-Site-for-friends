/* DemoVerse Service Worker — офлайн-кэш для GitHub Pages */
"use strict";

const VERSION = "demoverse-v1";
const CORE = [
  "./",
  "./index.html",
  "./about.html",
  "./components.html",
  "./gallery.html",
  "./games.html",
  "./apps.html",
  "./quiz.html",
  "./blog.html",
  "./article-1.html",
  "./article-2.html",
  "./article-3.html",
  "./forms.html",
  "./tables.html",
  "./media.html",
  "./faq.html",
  "./contact.html",
  "./404.html",
  "./css/style.css",
  "./js/main.js",
  "./js/games.js",
  "./js/apps.js",
  "./js/quiz.js",
  "./js/tables.js",
  "./js/forms.js",
  "./js/gallery.js",
  "./js/components.js",
  "./js/media.js",
  "./favicon.svg",
  "./manifest.webmanifest",
  "./img/hero.jpg",
  "./img/icon-512.png",
  "./img/gallery/nature.jpg",
  "./img/gallery/city.jpg",
  "./img/gallery/abstract.jpg",
  "./img/gallery/animal.jpg",
  "./img/gallery/space.jpg",
  "./img/gallery/ocean.jpg"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(VERSION).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // кэшируем только внутренние ресурсы
        if (resp.ok && new URL(e.request.url).origin === self.location.origin) {
          const copy = resp.clone();
          caches.open(VERSION).then(c => c.put(e.request, copy));
        }
        return resp;
      }).catch(() => caches.match("./404.html"));
    })
  );
});
