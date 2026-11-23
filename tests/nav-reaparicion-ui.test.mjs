// tests/nav-reaparicion-ui.test.mjs — la app real en jsdom: la barra oculta
// reaparece sola tras una pausa, sin oscilar y sin "rebotar" al bajar.
// El reloj es virtual: la pausa ahora dura 90 s, así que los tests avanzan
// el tiempo al instante en vez de esperar ministros reales.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";
import * as store from "../src/estado/store.js";
import { datosDemo } from "../src/datos/demo.js";
import { REAPARICION_MS } from "../src/ui/nav-scroll.js";

assert.equal(REAPARICION_MS, 90000, "la pausa de reaparición es de 90 s");

/* --- reloj virtual -------------------------------------------------------
   Reemplaza Date.now y setTimeout/clearTimeout globales (los que usa main.js)
   por una versión controlada. `avanzar(ms)` corre los timers vencidos en orden. */
const relojReal = { now: Date.now, set: globalThis.setTimeout, clear: globalThis.clearTimeout };
let ahoraVirtual = 1_000_000;
let proximoId = 1;
const timers = new Map();
globalThis.Date.now = () => ahoraVirtual;
globalThis.setTimeout = (fn, ms = 0, ...args) => {
  const id = proximoId++;
  timers.set(id, { fn, args, vence: ahoraVirtual + Math.max(0, ms), intervalo: null });
  return id;
};
globalThis.clearTimeout = (id) => { timers.delete(id); };
globalThis.setInterval = (fn, ms = 0, ...args) => {
  const id = proximoId++;
  timers.set(id, { fn, args, vence: ahoraVirtual + Math.max(0, ms), intervalo: Math.max(1, ms) });
  return id;
};
globalThis.clearInterval = (id) => { timers.delete(id); };
/* Los frames también van por el reloj virtual: si no, jsdom encadena frames
   reales y avanzar 90 s tardaría 90 s de verdad. */
globalThis.requestAnimationFrame = (fn) => {
  const id = proximoId++;
  timers.set(id, { fn, args: [ahoraVirtual], vence: ahoraVirtual + 16, intervalo: null });
  return id;
};
globalThis.cancelAnimationFrame = (id) => { timers.delete(id); };
const avanzar = async (ms) => {
  const objetivo = ahoraVirtual + ms;
  for (;;) {
    let siguiente = null;
    for (const [id, t] of timers) {
      if (t.vence <= objetivo && (!siguiente || t.vence < siguiente.t.vence || (t.vence === siguiente.t.vence && id < siguiente.id))) {
        siguiente = { id, t };
      }
    }
    if (!siguiente) break;
    ahoraVirtual = Math.max(ahoraVirtual, siguiente.t.vence);
    timers.delete(siguiente.id);
    siguiente.t.fn(...siguiente.t.args);
    if (siguiente.t.intervalo != null) {
      timers.set(siguiente.id, { ...siguiente.t, vence: ahoraVirtual + siguiente.t.intervalo });
    }
    await Promise.resolve(); // drena microtareas entre timers sin esperar el loop real
  }
  ahoraVirtual = objetivo;
  await new Promise((r) => relojReal.set(r, 0));
};
/* ------------------------------------------------------------------------ */

const RAIZ = process.cwd();
const HTML = fs.readFileSync(path.join(RAIZ, "index.html"), "utf8");
const errores = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => errores.push("jsdom: " + e.message));
vc.on("error", (...a) => errores.push(a.map(String).join(" ")));
const dom = new JSDOM(HTML.replace(/&lt;script[\s\S]*?&lt;\/script>/g, ""), {
  url: "http://localhost/?demo=1",
  runScripts: "outside-only",
  pretendToBeVisual: true,
  virtualConsole: vc,
});
const w = dom.window;
const d = w.document;
for (const k of [
  "document", "navigator", "location", "history", "localStorage", "sessionStorage",
  "HTMLElement", "Element", "Node", "Event", "CustomEvent", "KeyboardEvent", "MouseEvent",
  "getComputedStyle",
  "Blob", "File", "FileReader", "URL", "FormData", "DOMParser",
]) {
  Object.defineProperty(globalThis, k, { value: w[k], configurable: true, writable: true });
}
Object.defineProperty(globalThis, "window", { value: w, configurable: true, writable: true });
w.matchMedia = globalThis.matchMedia = () => ({
  matches: false, addEventListener() {}, removeEventListener() {},
  addListener() {}, removeListener() {}, onchange: null, dispatchEvent() { return false; },
});
w.HTMLElement.prototype.inert = false;
w.scrollTo = () => {};
w.URL.createObjectURL = () => "blob:test";
globalThis.fetch = () => Promise.reject(new Error("sin red en test"));

await import("../src/main.js");

const esperar = (ms) => avanzar(ms);
const nav = () => d.querySelector("#nav");
const oculta = () => nav().classList.contains("oculta");
const geo = (y) => {
  Object.defineProperty(w, "scrollY", { value: y, configurable: true, writable: true });
  Object.defineProperty(d.documentElement, "clientHeight", { value: 700, configurable: true });
  Object.defineProperty(d.documentElement, "scrollHeight", { value: 2000, configurable: true });
};
const scroll = () => w.dispatchEvent(new w.Event("scroll"));
const anclar = async () => {
  geo(0);
  w.dispatchEvent(new w.Event("resize"));  // fija geometría sin decidir dirección
  scroll();
  await esperar(20);
};
const rueda = (delta) => {
  const e = new w.Event("wheel");
  e.deltaY = delta;
  e.deltaMode = 0;
  w.dispatchEvent(e);
};

test("barra oculta al bajar, vuelve sola tras ~90 s y se queda quieta", async () => {
  store.boot(datosDemo());
  await anclar();
  rueda(200); geo(200); scroll(); await esperar(20);
  assert.equal(oculta(), true, "bajar oculta");
  await esperar(REAPARICION_MS - 1000);
  assert.equal(oculta(), true, "antes de la pausa sigue oculta");
  await esperar(1200);
  assert.equal(oculta(), false, "vuelve tras la pausa de 90 s");
  await esperar(5000);
  assert.equal(oculta(), false, "no vuelve a ocultarse sin un gesto nuevo");
  assert.deepEqual(errores, []);
});

test("un gesto nuevo reanuda el ocultamiento; bajar seguido no rebota", async () => {
  store.boot(datosDemo());
  await anclar();
  rueda(200); geo(200); scroll(); await esperar(20);
  await esperar(REAPARICION_MS + 500);
  assert.equal(oculta(), false, "ya reapareció por pausa");
  /* Varios eventos de rueda hacia abajo seguidos: la nav baja y no vuelve
     a aparecer hasta que haya una pausa real. */
  for (let i = 1; i <= 6; i++) {
    rueda(100); geo(200 + i * 80); scroll();
    await esperar(30);
    assert.equal(oculta(), true, "evento " + i + " de la bajada");
  }
  assert.equal(oculta(), true, "sigue oculta al terminar la bajada");
  assert.deepEqual(errores, []);
});

test("las 7 secciones ocultan y reaparecen igual con la pausa de 90 s", async () => {
  const secciones = ["inicio", "agenda", "pedidos", "inventario", "contactos", "historial", "ajustes"];
  store.boot(datosDemo());
  for (const sec of secciones) {
    d.querySelector(`#nav button[data-v="${sec}"]`).click();
    await anclar();
    rueda(200); geo(200); scroll(); await esperar(30);
    assert.equal(oculta(), true, sec + " oculta al bajar");
    await esperar(REAPARICION_MS + 500);
    assert.equal(oculta(), false, sec + " vuelve tras ~90 s");
    await esperar(1000);
    assert.equal(oculta(), false, sec + " no oscila");
  }
  assert.deepEqual(errores, []);
});
