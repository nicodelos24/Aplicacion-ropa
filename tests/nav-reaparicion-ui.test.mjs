// tests/nav-reaparicion-ui.test.mjs — la app real en jsdom: la barra oculta
// reaparece sola tras una pausa, sin oscilar y sin "rebotar" al bajar.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";
import * as store from "../src/estado/store.js";
import { datosDemo } from "../src/datos/demo.js";

const RAIZ = process.cwd();
const HTML = fs.readFileSync(path.join(RAIZ, "index.html"), "utf8");
const errores = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => errores.push("jsdom: " + e.message));
vc.on("error", (...a) => errores.push(a.map(String).join(" ")));
const dom = new JSDOM(HTML.replace(/<script[\s\S]*?<\/script>/g, ""), {
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
  "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame",
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

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
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

test("barra oculta al bajar, vuelve sola tras ~2 s y se queda quieta", async () => {
  store.boot(datosDemo());
  await anclar();
  rueda(200); geo(200); scroll(); await esperar(20);
  assert.equal(oculta(), true, "bajar oculta");
  await esperar(1200);
  assert.equal(oculta(), true, "a los 1,2 s sigue oculta");
  await esperar(1000);
  assert.equal(oculta(), false, "vuelve tras la pausa");
  await esperar(1200);
  assert.equal(oculta(), false, "no vuelve a ocultarse sin un gesto nuevo");
  assert.deepEqual(errores, []);
});

test("un gesto nuevo reanuda el ocultamiento; bajar seguido no rebota", async () => {
  store.boot(datosDemo());
  await anclar();
  rueda(200); geo(200); scroll(); await esperar(20);
  await esperar(2200);
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

test("las 7 secciones ocultan y reaparecen igual con la pausa de 2 s", async () => {
  const secciones = ["inicio", "agenda", "pedidos", "inventario", "contactos", "historial", "ajustes"];
  store.boot(datosDemo());
  for (const sec of secciones) {
    d.querySelector(`#nav button[data-v="${sec}"]`).click();
    await anclar();
    rueda(200); geo(200); scroll(); await esperar(30);
    assert.equal(oculta(), true, sec + " oculta al bajar");
    await esperar(2200);
    assert.equal(oculta(), false, sec + " vuelve tras ~2 s");
    await esperar(900);
    assert.equal(oculta(), false, sec + " no oscila");
  }
  assert.deepEqual(errores, []);
});
