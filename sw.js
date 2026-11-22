/* sw.js — Ropa v2: cache-first para estáticos del shell. */
const CACHE = "ropa-v2-nav-fotos-r8";
const ASSETS = [
  "./", "./index.html", "./manifest.json",
  "./src/main.js", "./src/main.css",
  "./src/ui/tokens.css", "./src/ui/base.css", "./src/ui/motion.css",
  "./src/ui/dom.js", "./src/ui/iconos.js", "./src/ui/nav-scroll.js",
  "./src/ui/componentes/componentes.css", "./src/ui/componentes/capas.css",
  "./src/estado/store.js", "./src/estado/vista.js", "./src/datos/demo.js",
  "./src/datos/local.js", "./src/datos/fotos-demo.js",
  "./fotos/vestido.jpg", "./fotos/campera.jpg", "./fotos/jean.jpg",
  "./fotos/bolso.jpg", "./fotos/buzo.jpg",
  "./src/nucleo/nucleo.js", "./src/nucleo/ids.js",
  "./src/nucleo/moneda.js", "./src/nucleo/fechas.js", "./src/nucleo/pedidos.js",
  "./src/nucleo/contacto.js", "./src/nucleo/buscador.js",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (e.request.method === "GET" && res.ok && new URL(e.request.url).origin === location.origin) {
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
      }
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
