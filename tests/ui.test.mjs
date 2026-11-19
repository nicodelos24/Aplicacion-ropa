// tests/ui.test.mjs — la app V2 real montada en jsdom: arranque demo, ruteo por
// secciones, tema, vacíos y filtros de pedidos, detalle (cuotas y confirmación de
// estado) y ausencia de red. Reemplaza al viejo tests/ui.test.cjs, que evaluaba un
// <script> inline que la V2 ya no tiene.
//
// Cómo: se arma el esqueleto de index.html en jsdom, se instalan window/document/
// localStorage (y stubs de matchMedia, fetch y scroll) como globals y recién ahí se
// importa src/main.js como módulo ES. Un solo import por proceso: los módulos de la
// app guardan estado (store, vista), así que cada test lo reinicia con demo limpio.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";
import * as store from "../src/estado/store.js";
import { datosDemo } from "../src/datos/demo.js";
import { vista, emitirVista } from "../src/estado/vista.js";
import { aplicarTema } from "../src/pantallas/pantalla-ajustes.js";

const RAIZ = process.cwd();
const HTML = fs.readFileSync(path.join(RAIZ, "index.html"), "utf8");
const errores = [];
const llamadasRed = [];

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

/* Globals que los módulos ES esperan encontrar (main.js y pantallas usan el
   document global, no el del window que las importa). */
for (const k of [
  "document", "navigator", "location", "history", "localStorage", "sessionStorage",
  "HTMLElement", "Element", "Node", "Event", "CustomEvent", "KeyboardEvent", "MouseEvent",
  "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame",
  "Blob", "File", "FileReader", "URL", "FormData", "DOMParser",
]) {
  Object.defineProperty(globalThis, k, { value: w[k], configurable: true, writable: true });
}
Object.defineProperty(globalThis, "window", { value: w, configurable: true, writable: true });

/* jsdom no simula media queries ni layout; estas pruebas no dependen de geometría. */
const sinMovimiento = () => ({
  matches: false, addEventListener() {}, removeEventListener() {},
  addListener() {}, removeListener() {}, onchange: null, dispatchEvent() { return false; },
});
w.matchMedia = globalThis.matchMedia = sinMovimiento;
w.HTMLElement.prototype.inert = false;
w.scrollTo = () => {};
w.URL.createObjectURL = () => "blob:test";
const contar = (u) => { llamadasRed.push(String(u)); return Promise.reject(new Error("sin red en test")); };
w.fetch = globalThis.fetch = contar;

const fetchOriginal = globalThis.fetch;
await import(pathToFileURL(path.join(RAIZ, "src/main.js")).href);
globalThis.fetch = fetchOriginal;

const qs = (s) => d.querySelector(s);
const qsa = (s) => [...d.querySelectorAll(s)];
const esperar = (ms = 0) => new Promise((r) => setTimeout(r, ms));

function click(sel) {
  const el = typeof sel === "string" ? qs(sel) : sel;
  assert.ok(el, "falta el elemento " + sel);
  el.click();
  return el;
}

function irA(seccion) {
  click(`#nav button[data-v="${seccion}"]`);
  assert.equal(qs("#subtitle").textContent, {
    inicio: "Todo tu negocio en un vistazo", agenda: "Tu agenda",
    pedidos: "Catálogo de ventas", inventario: "Inventario de productos",
    contactos: "Tus contactos", historial: "Movimientos de cada cuenta",
    ajustes: "Configuración",
  }[seccion], "subtítulo de " + seccion);
  assert.doesNotMatch(qs("#main").innerHTML, /Algo falló/);
  assert.ok(qs("#main").innerHTML.length > 200, "pantalla " + seccion + " vacía");
}

/* Reinicio: demo limpia, sin hoja/lightbox/confirmación abiertas, Inicio. */
async function reiniciar() {
  qsa(".lightbox, .celebra").forEach((n) => n.remove());
  qs("#confirmar").classList.remove("abierta");
  qsa("#main, #hoja, nav, .topbar, .fab").forEach((el) => (el.inert = false));
  d.body.style.overflow = "";
  qs("#hoja").className = "hoja";
  qs("#hoja-in").innerHTML = "";
  vista.seccion = "inicio";
  vista.filtro = "all";
  vista.busqueda = "";
  vista.diaSel = null;
  qs("#search").value = "";
  /* Fuente única del tema: db().theme dentro de ropa_v2_data. */
  store.boot({ ...datosDemo(), theme: "dark" });
  aplicarTema();
  emitirVista();
  await esperar();
  errores.length = 0;
}

test("arranque demo: Inicio renderizado con los pedidos y la navegación activa", async () => {
  await reiniciar();
  assert.match(qs("#subtitle").textContent, /vistazo/);
  assert.ok(qs("#main").innerHTML.length > 1000);
  assert.ok(qsa("#main .card[data-pedido]").length > 0, "Inicio lista pedidos");
  assert.equal(qs('#nav button[data-v="inicio"]').classList.contains("on"), true);
  assert.deepEqual(errores, []);
});

test("navegación: las 7 secciones pintan su pantalla y mueven la pestaña activa", async () => {
  await reiniciar();
  for (const seccion of ["agenda", "pedidos", "inventario", "contactos", "historial", "ajustes", "inicio"]) {
    irA(seccion);
    assert.equal(qs(`#nav button[data-v="${seccion}"]`).classList.contains("on"), true, "nav " + seccion);
    assert.equal(qsa("#nav button.on").length, 1, "una sola pestaña activa");
  }
  await reiniciar();
  irA("pedidos");
  assert.equal(qsa("#main .card[data-pedido]").length, 5, "5 pedidos demo");
  irA("inventario");
  assert.equal(qsa("#main .inv-card").length, 5, "5 productos demo");
  assert.deepEqual(errores, []);
});

test("tema: el botón alterna data-theme, persiste en ropa_v2_data.theme y cambia el ícono", async () => {
  await reiniciar();
  const temaGuardado = () => JSON.parse(w.localStorage.getItem("ropa_v2_data")).theme;
  /* La clave vieja quedó fuera de uso: no se siembra, no se lee, no se escribe. */
  assert.equal(w.localStorage.getItem("ropa_v2_tema"), null, "clave vieja inexistente");
  assert.equal(d.documentElement.dataset.theme, "dark");
  assert.equal(temaGuardado(), "dark");

  const iconoOscuro = qs("#themeBtn").innerHTML;
  click("#themeBtn");
  assert.equal(d.documentElement.dataset.theme, "light");
  assert.notEqual(qs("#themeBtn").innerHTML, iconoOscuro);
  assert.equal(store.db().theme, "light", "el tema queda en el store");
  assert.equal(temaGuardado(), "light", "persiste en ropa_v2_data.theme");
  assert.equal(w.localStorage.getItem("ropa_v2_tema"), null, "clave vieja sigue sin usarse");

  click("#themeBtn");
  assert.equal(d.documentElement.dataset.theme, "dark");
  assert.equal(store.db().theme, "dark");
  assert.equal(temaGuardado(), "dark", "persiste en ropa_v2_data.theme");
  assert.equal(w.localStorage.getItem("ropa_v2_tema"), null, "clave vieja sigue sin usarse");
  irA("ajustes");
  assert.match(qs("#tema-btn").textContent, /modo claro/);
  assert.deepEqual(errores, []);
});

test("pedidos: los chips filtran por estado y muestran su contador", async () => {
  await reiniciar();
  irA("pedidos");
  const chips = qsa("#chips .chip");
  assert.ok(chips.length >= 4);
  assert.match(qs('#chips .chip[data-k="paid"]').textContent, /\(2\)/);
  click('#chips .chip[data-k="paid"]');
  assert.equal(qsa("#main .card[data-pedido]").length, 2, "dos pagados");
  assert.equal(qs('#chips .chip[data-k="paid"]').classList.contains("on"), true);
  click('#chips .chip[data-k="new"]');
  assert.equal(qsa("#main .card[data-pedido]").length, 1, "un nuevo");
  assert.deepEqual(errores, []);
});

test("pedidos: búsqueda sin coincidencias muestra el vacío con la consulta", async () => {
  await reiniciar();
  irA("pedidos");
  qs("#search").value = "zzz";
  qs("#search").dispatchEvent(new w.Event("input", { bubbles: true }));
  assert.match(qs("#main .vacio").textContent, /Sin resultados/);
  assert.match(qs("#main .vacio").textContent, /zzz/);
  qs("#search").value = "";
  qs("#search").dispatchEvent(new w.Event("input", { bubbles: true }));
  assert.equal(qsa("#main .card[data-pedido]").length, 5, "vuelve la lista completa");
  assert.deepEqual(errores, []);
});

test("pedidos: sin datos aparece el vacío de bienvenida con Nuevo pedido", async () => {
  await reiniciar();
  store.borrarDatos();
  await esperar();
  irA("pedidos");
  assert.match(qs("#main .vacio").textContent, /Sin pedidos aquí/);
  assert.match(qs("#main .vacio").textContent, /botón \+/);
  assert.ok(qs('#main [data-acc="nuevo"]'), "ofrece crear el primero");
  assert.equal(qsa("#main .card[data-pedido]").length, 0);
  click('#main [data-acc="nuevo"]');
  assert.equal(store.db().orders.length, 0, "abrir el editor no crea nada");
  await esperar(220);
  assert.ok(qs("#hoja-in").innerHTML.length > 100, "abre el editor de pedido");
  assert.deepEqual(errores, []);
});

test("detalle: las cuotas tienen piso 0 y al completarlas el pedido pasa a Pagado", async () => {
  await reiniciar();
  irA("pedidos");
  click('#main .card[data-pedido="d3"]');
  assert.equal(store.pedidoPorId("d3").estado, "due");
  assert.ok(qs("#cq-minus") && qs("#cq-plus"));
  click("#cq-minus");
  click("#cq-minus");
  assert.equal(store.pedidoPorId("d3").cuotasPagadas, 0, "no baja de 0");
  assert.equal(store.pedidoPorId("d3").estado, "due");
  for (let i = 0; i < 3; i++) click("#cq-plus");
  assert.equal(store.pedidoPorId("d3").cuotasPagadas, 3);
  assert.equal(store.pedidoPorId("d3").estado, "paid", "completar cuotas paga");
  await esperar(220);
  assert.equal(qs("#hoja").classList.contains("abierta"), false, "la hoja se cierra");
  assert.deepEqual(errores, []);
});

test("detalle: cambiar estado pide confirmación, cancelar no muta y aceptar sí", async () => {
  await reiniciar();
  irA("pedidos");
  click('#main .card[data-pedido="d3"]');
  click('[data-st="paid"]');
  assert.equal(qs("#confirmar").classList.contains("abierta"), true);
  assert.match(qs("#cv-t").textContent, /Cambiar estado/);
  click("#cv-no");
  await esperar();
  assert.equal(store.pedidoPorId("d3").estado, "due", "cancelar no muta");
  assert.equal(qs('[data-st="due"]').getAttribute("aria-pressed"), "true");
  click('[data-st="paid"]');
  click("#cv-yes");
  await esperar();
  assert.equal(store.pedidoPorId("d3").estado, "paid", "aceptar paga");
  assert.deepEqual(errores, []);
});

test("detalle: Enter en una tarjeta del stack la selecciona sin abrir el lightbox", async () => {
  await reiniciar();
  irA("pedidos");
  click('#main .card[data-pedido="d3"]');
  const tarjeta = qs("#dstack .dcard");
  assert.ok(tarjeta, "hay tarjetas de producto");
  tarjeta.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
  assert.equal(tarjeta.getAttribute("aria-pressed"), "true");
  assert.equal(qsa("#dstack .dcard.sel").length, 1);
  assert.equal(qs(".lightbox"), null, "sin foto no hay lightbox");
  assert.deepEqual(errores, []);
});

test("ajustes: restaurar demo pide confirmación y vuelve a los datos originales", async () => {
  await reiniciar();
  store.crearPedido({ cliente: "Prueba", items: [{ productoId: "di1", qty: 1 }] });
  assert.equal(store.pedidos().length, 6);
  irA("ajustes");
  click("#reset-btn");
  assert.equal(qs("#confirmar").classList.contains("abierta"), true);
  click("#cv-yes");
  await esperar();
  assert.equal(store.pedidos().length, 5, "demo restaurada");
  assert.deepEqual(errores, []);
});

test("demo no toca la red: ningún fetch y ninguna referencia a Firebase en el código", async () => {
  await reiniciar();
  for (const seccion of ["inicio", "pedidos", "inventario", "contactos", "agenda", "historial", "ajustes"]) {
    irA(seccion);
  }
  irA("pedidos");
  click('#main .card[data-pedido="d3"]');
  click("#hClose");
  await esperar(220);
  assert.deepEqual(llamadasRed, [], "la demo no descarga nada");
  assert.equal(w.firebase, undefined, "sin SDK de Firebase");
  const fuentes = fs.readdirSync(path.join(RAIZ, "src"), { recursive: true })
    .filter((f) => String(f).endsWith(".js"));
  for (const rel of fuentes) {
    const codigo = fs.readFileSync(path.join(RAIZ, "src", String(rel)), "utf8");
    assert.doesNotMatch(codigo, /firebase|firestore/i, "src/" + rel + " no habla con la nube");
  }
  assert.deepEqual(errores, []);
});

test("tema oscuro: se quita el neon de las tarjetas sin tocar el color ni el modo claro", async () => {
  const css = fs.readFileSync(path.join(RAIZ, "src/ui/componentes/componentes.css"), "utf8");
  /* La regla base (modo claro) conserva el resplandor interior tal cual. */
  for (const color of ["yellow", "orange", "blue", "green"]) {
    const base = new RegExp(`\\.borde-${color}\\{box-shadow:var\\(--sh-1\\), var\\(--inset-hair\\), inset 14px 0 22px -18px color-mix`);
    assert.match(css, base, `modo claro conserva el resplandor de ${color}`);
    /* El borde de color sigue existiendo (no se pierde el color). */
    assert.match(css, new RegExp(`\\.borde-${color}\\{border-left:3px solid var\\(--c-${color}\\)\\}`),
      `se conserva el color del borde ${color}`);
  }
  /* Existe el override sólo para oscuro (html sin data-theme="light"). */
  assert.match(css, /html:not\(\[data-theme="light"\]\) \.borde-yellow/, "override en modo oscuro");
  const dark = /html:not\(\[data-theme="light"\]\)\s+([^{]+)\{box-shadow:([^}]+)\}/.exec(css);
  assert.ok(dark, "regla de box-shadow en oscuro");
  for (const color of ["yellow", "orange", "blue", "green"]) {
    assert.match(dark[1], new RegExp(`\\.borde-${color}`), `oscuro cubre ${color}`);
  }
  assert.match(dark[2], /var\(--sh-1\)/, "conserva sombra base");
  assert.match(dark[2], /var\(--inset-hair\)/, "conserva hairline interior");
  assert.doesNotMatch(dark[2], /inset 14px|color-mix|neon/, "sin resplandor interior en oscuro");
  /* El token global de acento (botones/FAB) no se modifica en la regla oscura. */
  assert.doesNotMatch(dark[2], /--sh-acc/, "no toca --sh-acc");
  assert.deepEqual(errores, []);
});

test("PWA: el ícono existe, la app carga como módulo y el service worker cachea el shell", async () => {
  assert.equal(fs.readFileSync(path.join(RAIZ, "favicon.ico")).readUInt32LE(0), 65536);
  assert.match(HTML, /<link rel="icon" href="favicon.ico"/);
  assert.match(HTML, /<script type="module" src="src\/main\.js">/);
  for (const ruta of ["src", "pantallas", "componentes", "estado", "datos", "nucleo", "servicios", "ui"]) {
    const dir = path.join(RAIZ, "src", ruta);
    if (fs.existsSync(dir)) {
      for (const rel of fs.readdirSync(dir, { recursive: true }).filter((f) => String(f).endsWith(".js"))) {
        const relUrl = "./src/" + ruta + "/" + String(rel).split(path.sep).join("/");
        assert.ok(fs.existsSync(path.join(RAIZ, relUrl)), "existe " + relUrl);
      }
    }
  }
  const sw = fs.readFileSync(path.join(RAIZ, "sw.js"), "utf8");
  assert.match(sw, /\.\/src\/main\.js/);
  assert.match(sw, /\.\/index\.html/);
  for (const fijo of ["src/estado/store.js", "src/nucleo/pedidos.js", "src/ui/componentes/componentes.css"]) {
    assert.ok(sw.includes("./" + fijo), "el precache incluye " + fijo);
  }
});
