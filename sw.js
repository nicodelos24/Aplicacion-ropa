/* sw.js — Ropa v2: cache-first para estáticos del shell.
 *
 * Generación coherente: el código de la app es un grafo de módulos ES que se
 * importan entre sí sin versión en la URL. Si el SW mezcla archivos de dos
 * builds (por ejemplo `main.js` nuevo con un `store.js` viejo en caché), el
 * navegador rompe el `import` con "does not provide an export named ...". Por eso:
 *  - una caché por generación (`CACHE` en la URL de cada asset al guardar);
 *  - respuesta solo desde la generación que ya está completa
 *    (`listo`): si la nueva no precargó entera, se va a la red y no se fusiona;
 *  - la generación vieja se borra en `activate`, antes de tomar el control.
 */
const VERSION = "r33";
const CACHE = "ropa-v2-nav-1500ms-" + VERSION;
const ASSETS = [
  "./", "./index.html", "./manifest.json",
  "./src/main.js", "./src/main.css",
  "./src/ui/tokens.css", "./src/ui/base.css", "./src/ui/motion.css",
  "./src/ui/dom.js", "./src/ui/iconos.js", "./src/ui/nav-scroll.js",
  "./src/ui/componentes/componentes.css", "./src/ui/componentes/capas.css",
  "./src/ui/componentes/secciones.css",
  "./src/ui/componentes/filtros.css",
  "./src/ui/componentes/picker.css",
  "./src/ui/componentes/foto-picker.js",
  "./src/ui/componentes/aviso-disco.js",
  "./src/nucleo/avisos-disco.js",
  "./src/estado/store.js", "./src/estado/vista.js", "./src/datos/demo.js",
  "./src/datos/local.js", "./src/datos/fotos-demo.js",
  "./fotos/vestido.jpg", "./fotos/campera.jpg", "./fotos/jean.jpg",
  "./fotos/bolso.jpg", "./fotos/buzo.jpg",
  "./src/nucleo/index.js", "./src/nucleo/ids.js",
  "./src/nucleo/pedido-picker.js",
  "./src/nucleo/moneda.js", "./src/nucleo/fechas.js", "./src/nucleo/pedidos.js",
  "./src/nucleo/contacto.js", "./src/nucleo/buscador.js", "./src/nucleo/secciones.js",
  "./src/nucleo/orden.js",
];

/* Cada asset vive bajo una URL que nombra su generación: una caché vieja no
   puede contestar el pedido de la nueva, porque ni siquiera tiene esa clave. */
const GENERADO = /[?&]gen=/.test(location.search) ? "" : "?gen=" + VERSION;
const clave = (url) => url + GENERADO;

let listo = false; // la generación de este SW precargó completa

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS.map(clave)))
      .then(() => { listo = true; })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => listo = true)
  );
});

/* Módulos y navegación: solo desde la generación completa; si algo falta,
   red (nunca un archivo de otra generación). */
const CRITICO = (req) =>
  req.mode === "navigate" ||
  req.destination === "script" || req.destination === "style" || req.destination === "worker" ||
  /\.(m?js|css|html)(\?|$)/.test(new URL(req.url).pathname + new URL(req.url).search);

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const critico = CRITICO(req);
  e.respondWith(
    (async () => {
      /* con la generación incompleta no se contesta código desde caché */
      const hit = critico && !listo ? null : await caches.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok && (!critico || listo)) {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {});
        }
        return res;
      } catch (err) {
        if (req.mode === "navigate") {
          return (await caches.match(clave("./index.html"))) || (await caches.match("./index.html")) || Response.error();
        }
        throw err;
      }
    })()
  );
});
