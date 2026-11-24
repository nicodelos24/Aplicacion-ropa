// tests/sw-generacion.test.mjs — el salto de generación del service worker.
//
// Incidente: en el vivo, el primer ingreso con el SW r25 (y su `store.js` en
// caché) y el código r26 respondió `The requested module '../estado/store.js'
// does not provide an export named 'secciones'` y el inventario no montó. Era
// un híbrido de dos builds: mezclar un módulo nuevo con otro viejo rompe el
// grafo de imports de la app.
//
// Este test corre el sw.js real en un sandbox de node:vm con una imitación de
// CacheStorage y una "red" que sirve los archivos del repo, y comprueba que
//  1) la generación vieja se borra al activar la nueva,
//  2) los módulos se piden con la generación en la URL (una caché vieja no
//     puede contestarlos),
//  3) antes de que la generación nueva precargue entera no se responde nada de
//     la caché, y
//  4) el `store.js` que llega al navegador exporta `secciones`, así que el
//     inventario monta igual.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { pathToFileURL } from "node:url";

const RAIZ = process.cwd();
const ORIGEN = "http://127.0.0.1:8199";
const CODIGO = fs.readFileSync(path.join(RAIZ, "sw.js"), "utf8");
const VERSION = (CODIGO.match(/const VERSION = "([\w-]+)"/) || [])[1];
assert.ok(VERSION, "sw.js declara su VERSION");
const CACHE_NUEVA = (CODIGO.match(/const CACHE = "([^"]+)" \+ VERSION/) || [])[1] + VERSION;
const CACHE_VIEJA = "ropa-v2-nav-1500ms-r31";

/* Texto del store anterior a f8430f4: no conoce las secciones. */
const STORE_VIEJO = "// store.js previo a f8430f4\nexport const pedidos = () => [];\nexport const productos = () => [];\n";

const abs = (url) => new URL(url, ORIGEN).href;
const pedido = (url, extra = {}) => ({
  url: abs(url), method: "GET", mode: "cors", destination: "", clone() { return this; }, ...extra,
});
const respuesta = (url, cuerpo, ok = true, status = ok ? 200 : 404) => ({
  ok, status, url, clone() { return this; }, async text() { return cuerpo; },
});

/* Red real: los archivos del repo. */
async function red(req) {
  const u = new URL(typeof req === "string" ? req : req.url, ORIGEN);
  let ruta = decodeURIComponent(u.pathname).replace(/^\/+/, "");
  if (ruta === "" || ruta.endsWith("/")) ruta += "index.html";
  const archivo = path.join(RAIZ, ruta);
  if (!archivo.startsWith(RAIZ) || !fs.existsSync(archivo)) return respuesta(u.href, "no está", false);
  return respuesta(u.href, fs.readFileSync(archivo, "utf8"));
}

class CacheFalsa {
  constructor(nombre) { this.nombre = nombre; this.entradas = new Map(); }
  async addAll(urls) {
    const pares = [];
    for (const u of urls) {
      const url = abs(u);
      const r = await red(url);
      if (!r.ok) throw new Error("precache falló: " + url);
      pares.push([url, r]);
    }
    for (const [url, r] of pares) this.entradas.set(url, r);
  }
  async put(req, res) { this.entradas.set(abs(typeof req === "string" ? req : req.url), res); }
  async match(req) { return this.entradas.get(abs(typeof req === "string" ? req : req.url)); }
  async keys() { return [...this.entradas.keys()].map((url) => pedido(url)); }
  async delete(req) { this.entradas.delete(abs(typeof req === "string" ? req : req.url)); }
}

function almacen() {
  const mapa = new Map();
  return {
    _mapa: mapa,
    async open(nombre) { if (!mapa.has(nombre)) mapa.set(nombre, new CacheFalsa(nombre)); return mapa.get(nombre); },
    async keys() { return [...mapa.keys()]; },
    async delete(nombre) { return mapa.delete(nombre); },
    async match(req) {
      for (const c of mapa.values()) { const h = await c.match(req); if (h) return h; }
      return undefined;
    },
    async has() { return false; },
  };
}

/* Corre sw.js en un contexto propio, con sus propios caches y su red. */
function cargarSW({ caches, red: redFalsa = red }) {
  const manejadores = {};
  const promesas = [];
  const esperar = () => Promise.all(promesas);
  const self = {
    addEventListener(tipo, fn) { (manejadores[tipo] = manejadores[tipo] || []).push(fn); },
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
    location: { origin: ORIGEN, search: "" },
  };
  const ctx = vm.createContext({
    self, caches, fetch: redFalsa,
    location: { origin: ORIGEN, search: "" },
    URL, Promise, console, setTimeout,
  });
  vm.runInContext(CODIGO, ctx, { filename: "sw.js" });
  const disparar = async (tipo, req) => {
    promesas.length = 0;
    for (const fn of manejadores[tipo] || []) {
      fn({ waitUntil: (p) => promesas.push(p), request: req, respondWith: (p) => promesas.push(p) });
    }
    await esperar();
    return promesas[0];
  };
  return { disparar, manejadores };
}

test("generación nueva: borra la caché vieja y sirve el store.js con secciones", async () => {
  const caches = almacen();
  /* estado del incidente: SW r25 con su store.js sin secciones en caché */
  const vieja = await caches.open(CACHE_VIEJA);
  await vieja.put(pedido("src/estado/store.js"), respuesta(abs("src/estado/store.js"), STORE_VIEJO));
  await vieja.put(pedido("src/main.js"), respuesta(abs("src/main.js"), "// main.js viejo"));

  const sw = cargarSW({ caches });
  await sw.disparar("install");
  await sw.disparar("activate");

  assert.deepEqual(await caches.keys(), [CACHE_NUEVA], "la generación anterior se borra al activar");

  /* Claus: una caché vieja no puede contestar, porque las claves nombran la generación. */
  assert.equal(await caches.match(pedido("src/estado/store.js")), undefined, "la URL sin generación no tiene entrada cacheada");

  const res = await sw.disparar("fetch", pedido("src/estado/store.js?gen=" + VERSION, { destination: "script" }));
  const cuerpo = await res.text();
  assert.match(cuerpo, /export const secciones/, "el store.js servido es el actual y exporta secciones");
  assert.doesNotMatch(cuerpo, /previo a f8430f4/, "nunca sale el store.js de la generación anterior");
  assert.ok(res.ok);
});

test("antes de precargar la generación nueva, los módulos van a la red (no a la caché)", async () => {
  const caches = almacen();
  /* algo quedó guardado bajo la clave nueva, pero esta instancia no terminó de precargar */
  const nueva = await caches.open(CACHE_NUEVA);
  await nueva.put(pedido("src/estado/store.js?gen=" + VERSION), respuesta(abs("src/estado/store.js"), STORE_VIEJO));

  const sw = cargarSW({ caches });
  const res = await sw.disparar("fetch", pedido("src/estado/store.js?gen=" + VERSION, { destination: "script" }));
  const cuerpo = await res.text();
  assert.match(cuerpo, /export const secciones/, "sin precarga completa manda la red, con el archivo real");
});

test("la navegación con caché vieja cae en el index.html de la generación nueva", async () => {
  const caches = almacen();
  const vieja = await caches.open(CACHE_VIEJA);
  await vieja.put(pedido("index.html"), respuesta(abs("index.html"), "<html>viejo</html>"));
  const sw = cargarSW({ caches });
  await sw.disparar("install");
  await sw.disparar("activate");
  /* navegación sin red: el respaldo es el index.html de la generación que sí precargó */
  const swSinRed = cargarSW({ caches, red: async () => { throw new Error("sin red"); } });
  await swSinRed.disparar("install");
  await swSinRed.disparar("activate");
  const res = await swSinRed.disparar("fetch", pedido("?demo=1", { mode: "navigate", destination: "document" }));
  const cuerpo = await res.text();
  assert.match(cuerpo, /<title>Ropa v2/, "sirve el index.html de la generación completa");
  assert.doesNotMatch(cuerpo, /viejo/, "no el de la caché anterior");
});

test("el store.js actual exporta secciones y el inventario lo importa de ahí", async () => {
  const store = await import(pathToFileURL(path.join(RAIZ, "src/estado/store.js")).href);
  assert.equal(typeof store.secciones, "function", "store.js exporta secciones");
  const inventario = fs.readFileSync(path.join(RAIZ, "src/pantallas/pantalla-inventario.js"), "utf8");
  assert.match(inventario, /import \{[^}]*\bsecciones\b[^}]*\} from "\.\.\/estado\/store\.js"/, "la pantalla de inventario toma secciones del store");
  const cuerpo = (await (await red(pedido("src/estado/store.js"))).text());
  assert.match(cuerpo, /export const secciones/, "el archivo servido en el vivo coincide con el que exporta secciones");
});

test("el precache nombra la generación y el CACHE está en r38", () => {
  assert.match(CODIGO, /const VERSION = "r38"/, "VERSION en r38");
  assert.match(CODIGO, /const CACHE = "ropa-v2-nav-1500ms-" \+ VERSION/, "el nombre de caché sale de VERSION");
  assert.match(CODIGO, /\?gen=.*VERSION|"gen=" \+ VERSION/, "los assets se cachean con la generación en la URL");
});
