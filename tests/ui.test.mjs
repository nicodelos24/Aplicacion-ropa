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
  /* cerrarHoja() termina 180 ms después: si el test anterior guardó y cerró la
     hoja, esperar a que el flag interno se limpie para no dejarlo colgante. */
  if (qs("#hoja").classList.contains("cerrando")) await esperar(200);
  qsa(".lightbox, .celebra").forEach((n) => n.remove());
  qs("#confirmar").classList.remove("abierta");
  qs("#nav").classList.remove("oculta");
  qs("#nav").setAttribute("aria-hidden", "false");
  qsa("#main, #hoja, nav, .topbar, .fab").forEach((el) => (el.inert = false));
  d.body.style.overflow = "";
  qs("#hoja").className = "hoja";
  qs("#hoja-in").innerHTML = "";
  vista.seccion = "inicio";
  vista.filtro = "all";
  vista.busqueda = "";
  vista.diaSel = null;
  /* La agenda y el historial guardan su propio filtro/modo en vista: sin
     reiniciarlos, un test heredaría la vista que dejó el anterior. */
  vista.agendaModo = "calendario";
  vista.verPasadas = false;
  vista.logFiltro = "all";
  qs("#search").value = "";
  /* Inventario: el filtro, el orden y la vista alterna también viven en vista. */
  vista.invCategoria = "todas";
  vista.invOrden = "alta";
  vista.invVista = "grilla";
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
  assert.equal(qsa("#main .inv-card").length, 6, "6 productos demo");
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

test("pedidos: búsqueda sin coincidencias ofrece Limpiar búsqueda y vuelve a la lista", async () => {
  await reiniciar();
  irA("pedidos");
  qs("#search").value = "zzz";
  qs("#search").dispatchEvent(new w.Event("input", { bubbles: true }));
  assert.match(qs("#main .vacio").textContent, /Sin resultados/);
  assert.match(qs("#main .vacio").textContent, /zzz/);
  assert.match(qs('#main [data-acc="limpiar"]').textContent, /Limpiar búsqueda/);
  assert.equal(vista.busqueda, "zzz");
  click('#main [data-acc="limpiar"]');
  await esperar();
  assert.equal(qs("#search").value, "", "se limpia el input");
  assert.equal(vista.busqueda, "", "se limpia el estado de búsqueda");
  assert.equal(vista.filtro, "all", "vuelve al filtro sin filtrar");
  assert.equal(qsa("#main .card[data-pedido]").length, 5, "vuelve la lista completa");
  assert.deepEqual(errores, []);
});

test("contactos: la hoja del cliente nombra Pendientes de pago y Pagados", async () => {
  await reiniciar();
  irA("contactos");
  click('#main .cli[data-id="dc1"]');
  await esperar();
  const titulos = qsa("#hoja-in .sect-titulo").map(n => n.textContent);
  assert.ok(titulos.some(t => /^Pendientes de pago \(\d+\)$/.test(t)), "Pendientes de pago (n)");
  assert.ok(titulos.some(t => /^Pagados \(\d+\)$/.test(t)), "Pagados (n)");
  assert.ok(!titulos.some(t => /Hechos|^\s*Pendientes \(/.test(t)), "sin copy viejo");
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

test("detalle: las cuotas se guardan solo al confirmar y con piso 0", async () => {
  await reiniciar();
  irA("pedidos");
  click('#main .card[data-pedido="d3"]');
  assert.equal(store.pedidoPorId("d3").estado, "due");
  assert.ok(qs("#cq-minus") && qs("#cq-plus"));
  /* nada se persiste mientras no se confirme */
  click("#cq-minus");
  click("#cq-minus");
  assert.equal(store.pedidoPorId("d3").cuotasPagadas, 1, "dos − no tocan el pedido guardado");
  click("#cq-minus");
  assert.match(qs(".cuotas-mid").textContent, /0 de 3/, "el contador no baja de 0 en pantalla");
  click("#cq-plus");
  click("#cq-plus");
  click("#cq-plus");
  click("#cq-plus");
  assert.match(qs(".cuotas-mid").textContent, /3 de 3/, "no pasa de las cuotas del pedido");
  assert.equal(store.pedidoPorId("d3").cuotasPagadas, 1, "sin guardar sigue en 1");
  click("#cq-guardar");
  await esperar(220);
  assert.equal(store.pedidoPorId("d3").cuotasPagadas, 3);
  assert.equal(store.pedidoPorId("d3").estado, "paid", "completar cuotas paga");
  assert.equal(qs("#hoja").classList.contains("abierta"), false, "la hoja se cierra");
  assert.deepEqual(errores, []);
});

test("detalle: «Descartar» revierte las cuotas y solo guarda lo confirmado", async () => {
  await reiniciar();
  irA("pedidos");
  click('#main .card[data-pedido="d3"]');
  click("#cq-plus");
  assert.match(qs(".cuotas-mid").textContent, /2 de 3/, "el contador sube en pantalla");
  assert.equal(qs("#cuotas-acciones").classList.contains("oculto"), false, "aparecen Guardar y Descartar");
  click("#cq-descartar");
  assert.match(qs(".cuotas-mid").textContent, /1 de 3/, "vuelve al valor guardado");
  assert.equal(qs("#cuotas-acciones").classList.contains("oculto"), true, "sin cambios no hay acciones");
  assert.equal(store.pedidoPorId("d3").cuotasPagadas, 1, "Descartar no persiste nada");
  /* guardar una cuota sola deja el pedido en curso */
  click("#cq-plus");
  click("#cq-guardar");
  await esperar(220);
  assert.equal(store.pedidoPorId("d3").cuotasPagadas, 2);
  assert.equal(store.pedidoPorId("d3").estado, "due", "sin completar sigue debiendo");
  assert.deepEqual(errores, []);
});

test("detalle: cerrar con cuotas sin guardar avisa y cancelar no las pierde", async () => {
  await reiniciar();
  irA("pedidos");
  click('#main .card[data-pedido="d3"]');
  click("#cq-plus");
  click("#dCerrar");
  await esperar();
  assert.equal(qs("#confirmar").classList.contains("abierta"), true, "pide confirmación");
  assert.match(qs("#cv-t").textContent, /cuotas/i);
  click("#cv-no");
  await esperar(220);
  assert.equal(qs("#hoja").classList.contains("abierta"), true, "la hoja sigue abierta");
  assert.match(qs(".cuotas-mid").textContent, /2 de 3/, "el cambio pendiente sigue ahí");
  click("#dCerrar");
  await esperar();
  click("#cv-yes");
  await esperar(220);
  assert.equal(qs("#hoja").classList.contains("abierta"), false, "salir sin guardar cierra");
  assert.equal(store.pedidoPorId("d3").cuotasPagadas, 1, "salir sin guardar no persiste");
  assert.deepEqual(errores, []);
});

test("detalle: Escape con cuotas sin guardar pregunta antes de cerrar (una sola vez)", async () => {
  await reiniciar();
  irA("pedidos");
  click('#main .card[data-pedido="d3"]');
  click("#cq-plus");
  d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await esperar();
  assert.equal(qs("#confirmar").classList.contains("abierta"), true, "abre el aviso");
  click("#cv-no");
  await esperar();
  assert.equal(qs("#hoja").classList.contains("abierta"), true, "no cerró");
  assert.equal(qs("#confirmar").classList.contains("abierta"), false, "el aviso se cerró");
  /* regresión: un Escape sin aviso abierto cierra la hoja, no la deja trabada */
  d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await esperar();
  assert.equal(qs("#confirmar").classList.contains("abierta"), true, "vuelve a preguntar");
  click("#cv-no");
  await esperar();
  assert.equal(qs("#hoja").classList.contains("abierta"), true, "la hoja sigue abierta y usable");
  assert.equal(store.pedidoPorId("d3").cuotasPagadas, 1, "nada se persistió");
  assert.deepEqual(errores, []);
});

test("aviso: Escape cierra el aviso una sola vez y no reabre otro encima", async () => {
  await reiniciar();
  irA("pedidos");
  click('#main .card[data-pedido="d3"]');
  click("#cq-plus");
  /* Escape sobre la hoja del detalle abre el aviso de cambios sin guardar */
  d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await esperar();
  assert.equal(qs("#confirmar").classList.contains("abierta"), true, "primer aviso");
  /* Escape en el aviso: lo cierra y NO debe volver a abrirse en el mismo gesto */
  d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await esperar();
  assert.equal(qs("#confirmar").classList.contains("abierta"), false, "el aviso se cierra y no se reabre");
  assert.equal(qs("#hoja").classList.contains("abierta"), true, "la hoja conserva los cambios");
  assert.match(qs(".cuotas-mid").textContent, /2 de 3/, "el cambio pendiente sigue en pantalla");
  assert.deepEqual(errores, []);
});

test("detalle: sin cambios no hay diálogos al cerrar", async () => {
  await reiniciar();
  irA("pedidos");
  click('#main .card[data-pedido="d3"]');
  click("#dCerrar");
  await esperar();
  assert.equal(qs("#confirmar").classList.contains("abierta"), false, "cerrar sin editar no pregunta");
  await esperar(220);
  assert.equal(qs("#hoja").classList.contains("abierta"), false);
  assert.deepEqual(errores, []);
});

test("editor de pedido: Cancelar con datos sin guardar avisa y no crea el pedido", async () => {
  await reiniciar();
  irA("pedidos");
  const antes = store.db().orders.length;
  click('#fab');
  await esperar();
  assert.equal(qs("#confirmar").classList.contains("abierta"), false, "abrir el editor no pregunta nada");
  qs("#f-cliente").value = "Clienta sin guardar";
  qs("#f-cliente").dispatchEvent(new w.Event("input", { bubbles: true }));
  click("#cancelar");
  await esperar();
  assert.equal(qs("#confirmar").classList.contains("abierta"), true, "pide confirmación al salir");
  assert.match(qs("#cv-t").textContent, /sin guardar/i);
  click("#cv-no");
  await esperar(220);
  assert.equal(qs("#hoja").classList.contains("abierta"), true, "sigue en el editor");
  assert.equal(qs("#f-cliente").value, "Clienta sin guardar", "no se perdió lo escrito");
  assert.equal(store.db().orders.length, antes, "nada se guardó solo");
  click("#cancelar");
  await esperar();
  click("#cv-yes");
  await esperar(220);
  assert.equal(qs("#hoja").classList.contains("abierta"), false, "sale sin guardar");
  assert.equal(store.db().orders.length, antes, "no creó ningún pedido");
  assert.deepEqual(errores, []);
});

test("editor de pedido: los +/− de cantidad no guardan hasta «Guardar cambios»", async () => {
  await reiniciar();
  irA("pedidos");
  click('#main .card[data-pedido="d4"]');
  await esperar();
  click("#hEdit");
  await esperar();
  const qtyAntes = store.pedidoPorId("d4").items[0].qty;
  click("#mode-inv .qtyplus");
  assert.equal(qs("#mode-inv .qtystep b").textContent.trim(), String(qtyAntes + 1), "sube en pantalla");
  assert.equal(store.pedidoPorId("d4").items[0].qty, qtyAntes, "el pedido guardado no cambia");
  click("#saveBtn");
  await esperar(220);
  assert.equal(store.pedidoPorId("d4").items[0].qty, qtyAntes + 1, "guardar sí persiste");
  assert.deepEqual(errores, []);
});

test("editor de pedido: sin tocar nada, Cancelar cierra sin preguntar", async () => {
  await reiniciar();
  irA("pedidos");
  click('#main .card[data-pedido="d4"]');
  await esperar();
  click("#hEdit");
  await esperar();
  click("#cancelar");
  await esperar();
  assert.equal(qs("#confirmar").classList.contains("abierta"), false, "no hay edición: no pregunta");
  await esperar(220);
  assert.equal(qs("#hoja").classList.contains("abierta"), false);
  assert.deepEqual(errores, []);
});

/* ---- decisión Y: selector del pedido en filas compactas por sección ---- */
const cabeceras = () => qsa("#pick-grupos .pk-cab").map((b) => ({
  nombre: b.querySelector(".pk-nombre").textContent.trim(),
  badge: b.querySelector(".pk-badge").textContent.trim(),
  elegidos: b.querySelector(".pk-badge").classList.contains("on"),
}));
const filasVisibles = () => qsa("#pick-grupos .pk-fila .pk-txt b").map((n) => n.textContent.trim());
const filasElegidas = () => qsa("#pick-grupos .pk-fila.on .pk-txt b").map((n) => n.textContent.trim());

test("pedido: el selector agrupa por sección con badge elegidos/total y filas de 52 px", async () => {
  await reiniciar();
  irA("pedidos");
  click('#main .card[data-pedido="d2"]');
  await esperar();
  click("#hEdit");
  await esperar();
  assert.deepEqual(cabeceras(), [
    { nombre: "Dama · verano", badge: "2", elegidos: false },
    { nombre: "Hombre · básicos", badge: "1/2", elegidos: true },
    { nombre: "Sin sección", badge: "1/2", elegidos: true },
  ], "cada sección con su badge; el de una sección con elegidos se tiñe");
  assert.deepEqual(filasElegidas(), ["Camisa blanca", "Corbata"], "lo elegido del pedido arranca marcado");
  assert.deepEqual(filasVisibles(), ["Vestido floral", "Pantalón negro", "Camisa blanca", "Abrigo largo", "Medias lanas", "Corbata"]);
  assert.equal(qs("#ftotal").textContent, "$1,250");
  assert.equal(qs("#ftotal-lbl").textContent, "2 productos elegidos", "el contador dice cuántas prendas lleva");
  /* la fila mide 52 px y el check tiene objetivo táctil de 44 px (maqueta Y) */
  const css = fs.readFileSync(path.join(RAIZ, "src/ui/componentes/picker.css"), "utf8");
  assert.match(css, /\.pk-fila\{[^}]*min-height:52px/, "la fila del selector mide 52 px");
  assert.match(css, /\.pk-check\{[^}]*width:22px/, "el check visible es de 22 px");
  assert.match(css, /\.pk-check::after\{[^}]*inset:-11px/, "con objetivo táctil de 44 px");
  assert.match(css, /prefers-reduced-motion:reduce/, "respeta reduce-motion");
  assert.deepEqual(errores, []);
});

test("pedido: buscar filtra dentro de las secciones, no deselecciona y el vacío tiene salida", async () => {
  await reiniciar();
  irA("pedidos");
  click('#main .card[data-pedido="d2"]');
  await esperar();
  click("#hEdit");
  await esperar();
  const input = qs("#pick-buscar");
  input.value = "vest";
  input.dispatchEvent(new w.Event("input", { bubbles: true }));
  await esperar();
  assert.deepEqual(filasVisibles(), ["Vestido floral", "Camisa blanca", "Corbata"], "aparece la coincidencia y se mantienen los elegidos");
  assert.deepEqual(filasElegidas(), ["Camisa blanca", "Corbata"], "buscar NO deselecciona");
  assert.equal(qs("#ftotal").textContent, "$1,250", "el total no cambia al buscar");

  input.value = "zzz";
  input.dispatchEvent(new w.Event("input", { bubbles: true }));
  await esperar();
  assert.match(qs("#pick-grupos .picker-vacio").textContent, /Ninguna prenda dice “zzz”/, "el vacío nombra la búsqueda");
  assert.equal(qs("#ftotal").textContent, "$1,250", "aunque no haya coincidencias el total sigue");
  click("#pick-limpiar");
  await esperar();
  assert.equal(qs("#pick-buscar").value, "", "el vacío limpia la búsqueda");
  assert.equal(qsa("#pick-grupos .pk-grupo").length, 3, "vuelven las tres secciones");
  assert.deepEqual(errores, []);
});

test("pedido: elegir una fila y plegar la sección no pierde lo elegido ni cambia el total sin guardar", async () => {
  await reiniciar();
  irA("pedidos");
  click('#main .card[data-pedido="d2"]');
  await esperar();
  click("#hEdit");
  await esperar();
  const vestido = qsa("#pick-grupos .pk-fila").find((f) => f.textContent.includes("Vestido floral"));
  vestido.click();
  await esperar();
  assert.deepEqual(filasElegidas(), ["Vestido floral", "Camisa blanca", "Corbata"]);
  assert.equal(qs("#ftotal").textContent, "$2,450", "suma el vestido al total");
  assert.equal(cabeceras()[0].badge, "1/2", "la sección Dama pasa a 1/2 (de 2 prendas)");
  assert.equal(store.pedidoPorId("d2").items.length, 2, "nada se guardó todavía");

  /* plegar la sección donde está el vestido: lo elegido sigue contando */
  click("#pick-grupos .pk-cab");
  await esperar();
  assert.equal(qs("#pick-grupos .pk-cab").getAttribute("aria-expanded"), "false");
  assert.equal(qs("#pick-grupos .pk-cuerpo").hidden, true, "el cuerpo queda oculto");
  assert.equal(qs("#ftotal").textContent, "$2,450", "plegar no toca el total");

  click("#saveBtn");
  await esperar(220);
  const despues = store.pedidoPorId("d2");
  assert.equal(despues.items.length, 3, "guardar sí persiste la prenda elegida");
  assert.ok(despues.items.some((i) => i.productoId === "di1"), "el vestido queda en el pedido");
  assert.equal(qs("#hoja").classList.contains("abierta"), false, "el editor se cierra al guardar");
  assert.deepEqual(errores, []);
});

test("editor de inventario: cerrar con cambios sin guardar avisa y conserva lo escrito", async () => {
  await reiniciar();
  irA("inventario");
  const antes = store.db().inventory.length;
  click('#fab');
  await esperar();
  qs("#inv-name").value = "Prenda sin guardar";
  click("#inv-cancelar");
  await esperar();
  assert.equal(qs("#confirmar").classList.contains("abierta"), true, "pide confirmación");
  assert.match(qs("#cv-t").textContent, /sin guardar/i);
  click("#cv-no");
  await esperar(220);
  assert.equal(qs("#hoja").classList.contains("abierta"), true, "sigue en el editor");
  assert.equal(qs("#inv-name").value, "Prenda sin guardar", "no se perdió lo escrito");
  assert.equal(store.db().inventory.length, antes, "nada se guardó solo");
  click("#inv-cancelar");
  await esperar();
  click("#cv-yes");
  await esperar(220);
  assert.equal(store.db().inventory.length, antes, "salir sin guardar no crea el producto");
  assert.deepEqual(errores, []);
});

test("editor de cliente: cerrar con cambios sin guardar avisa y no guarda solo", async () => {
  await reiniciar();
  irA("contactos");
  click('#fab');
  await esperar();
  qs("#ce-name").value = "Clienta sin guardar";
  click("#ce-cancelar");
  await esperar();
  assert.equal(qs("#confirmar").classList.contains("abierta"), true, "pide confirmación");
  assert.equal(store.clientes().some((c) => c.name === "Clienta sin guardar"), false, "no creó el cliente");
  click("#cv-no");
  await esperar(220);
  assert.equal(qs("#hoja").classList.contains("abierta"), true, "sigue en el editor");
  assert.equal(qs("#ce-name").value, "Clienta sin guardar", "no se perdió lo escrito");
  click("#ce-cancelar");
  await esperar();
  click("#cv-yes");
  await esperar(220);
  assert.equal(qs("#hoja").classList.contains("abierta"), false);
  assert.equal(store.clientes().some((c) => c.name === "Clienta sin guardar"), false, "salir sin guardar no crea nada");
  assert.deepEqual(errores, []);
});

test("detalle: cambiar estado pide confirmación, cancelar no muta y aceptar sí", async () => {
  await reiniciar();
  irA("pedidos");
  click('#main .card[data-pedido="d3"]');
  click('[data-st="paid"]');
  assert.equal(qs("#confirmar").classList.contains("abierta"), true);
  assert.match(qs("#cv-t").textContent, /Cambiar estado/);
  assert.equal(qs("#cv-yes").textContent, "Marcar como pagado", "CTA aclara el destino Pagado");
  assert.ok(qs("#cv-yes").classList.contains("neutral"), "confirmación neutral");
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

test("detalle: rechazar cerrar el aviso de cambio de estado no pierde la guardia de las cuotas", async () => {
  await reiniciar();
  irA("pedidos");
  click('#main .card[data-pedido="d3"]');
  click("#cq-plus"); /* 2 de 3 pendiente, sin guardar */
  click('[data-st="paid"]'); /* abre el aviso de estado */
  await esperar();
  click("#cv-no");
  await esperar();
  assert.equal(store.pedidoPorId("d3").estado, "due", "el estado no cambió");
  assert.match(qs(".cuotas-mid").textContent, /2 de 3/, "las cuotas pendientes siguen a la vista");
  /* regresión: cancelar el cambio de estado no debe borrar la guardia */
  click("#dCerrar");
  await esperar();
  assert.equal(qs("#confirmar").classList.contains("abierta"), true, "al cerrar vuelve a avisar por las cuotas");
  click("#cv-no");
  await esperar(220);
  assert.equal(qs("#hoja").classList.contains("abierta"), true, "no se cierra sin confirmar");
  assert.equal(store.pedidoPorId("d3").cuotasPagadas, 1, "nada se persistió");
  assert.deepEqual(errores, []);
});

test("detalle: cambiar el estado de un pedido con cuotas pendientes avisa antes de perderlas", async () => {
  await reiniciar();
  irA("pedidos");
  click('#main .card[data-pedido="d3"]');
  click("#cq-plus");
  click('[data-st="msg"]'); /* el cambio de estado ya pide su propia confirmación */
  await esperar();
  assert.equal(qs("#confirmar").classList.contains("abierta"), true, "el cambio de estado pide confirmación");
  click("#cv-yes");
  await esperar(260);
  click("#dCerrar");
  await esperar();
  const avisado = qs("#confirmar").classList.contains("abierta");
  assert.equal(avisado, true, "cerrar con algo pendiente avisa");
  click("#cv-yes");
  await esperar(220);
  assert.equal(store.pedidoPorId("d3").cuotasPagadas, 1, "salir sin guardar no persiste cuotas");
  assert.deepEqual(errores, []);
});

test("detalle: el primer toque selecciona y solo el segundo con foto abre el visor", async () => {
  await reiniciar();
  const foto = "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'/%3E";
  const items = [
    { nombre: "Artículo con imagen", precio: 100, qty: 2, foto },
    { nombre: "Artículo sin imagen", precio: 50, qty: 1, categoria: "ropa" },
  ];
  store.boot({ ...store.db(), orders: [{ id: "prueba", cliente: "Prueba visual", estado: "new", items }] });
  irA("pedidos");
  click('#main .card[data-pedido="prueba"]');
  const [conFoto, sinFoto] = qsa("#dstack .dcard");
  assert.equal(conFoto.tagName, "BUTTON", "activación por teclado nativa");
  assert.match(conFoto.getAttribute("aria-label"), /Artículo con imagen.*200/);
  assert.equal(conFoto.querySelector("img.dthumb").getAttribute("src"), foto);
  assert.ok(sinFoto.querySelector(".dthumb[aria-hidden=true] svg"));
  click(sinFoto);
  click(sinFoto);
  assert.equal(sinFoto.getAttribute("aria-pressed"), "true");
  assert.equal(qs(".lightbox"), null, "sin foto no hay lightbox");
  click(conFoto);
  assert.equal(sinFoto.getAttribute("aria-pressed"), "false");
  assert.equal(conFoto.getAttribute("aria-pressed"), "true");
  assert.equal(qs(".lightbox"), null, "el primer toque solo trae al frente");
  click(conFoto);
  assert.equal(qs(".lightbox img").getAttribute("src"), foto);
  assert.equal(d.activeElement, qs(".lbx"));
  click(".lbx");
  assert.equal(qs(".lightbox"), null);
  assert.equal(d.activeElement, conFoto, "devuelve el foco a la carta activa");
  assert.deepEqual(errores, []);
});

test("agenda: alternador Calendario ↔ Semanas y franja LU…DO con un solo día a la vez", async () => {
  await reiniciar();
  irA("agenda");
  /* Vista por defecto: calendario mensual, con el control de dos opciones. */
  assert.ok(qs("#main .cal"), "calendario presente por defecto");
  const switches = qsa("#main .agenda-switch-b");
  assert.equal(switches.length, 2, "dos opciones en el control");
  assert.deepEqual(switches.map((b) => b.dataset.modo), ["calendario", "semanas"]);
  assert.equal(switches[0].getAttribute("aria-pressed"), "true", "Calendario activo");

  /* Cambio a Semanas: franja de 7 días, encabezado L…D, día de hoy marcado. */
  click('#main .agenda-switch-b[data-modo="semanas"]');
  assert.ok(qs("#main .semana"), "vista semana activa");
  assert.equal(qs("#main .cal"), null, "calendario se oculta");
  assert.equal(qs('#main .agenda-switch-b[data-modo="semanas"]').getAttribute("aria-pressed"), "true", "Semanas activo");
  const dias = qsa("#main .sem-dia");
  assert.equal(dias.length, 7, "siete días en la franja");
  assert.deepEqual(dias.map((x) => x.querySelector(".sem-dow").textContent), ["L", "M", "M", "J", "V", "S", "D"]);
  assert.equal(qsa("#main .sem-dia.hoy").length, 1, "un solo día resaltado como hoy");

  /* REGRESIÓN: sin día elegido NO se muestran todas las cards de la semana juntas.
     Antes se agrupaban V 20/S 21 con el 19 resaltado: eso es lo que se corrige. */
  assert.equal(qsa("#main .sem-dia.sel").length, 0, "ningún día resaltado sin selección");
  assert.equal(qsa("#main .card[data-pedido]").length, 0, "sin selección no se listan tarjetas");
  assert.match(qs("#main .nota-vacia").textContent, /Tocá un día/, "invita a tocar un día");

  /* Las fechas demo son relativas a hoy: si hoy es domingo, la franja actual no
     tiene entregas (todas caen en la semana siguiente). En ese caso navegamos
     una semana: el ancla queda seleccionada, así que elegimos otro día con
     puntos para probar el toggle sin depender del día en que corra el test. */
  let conPedido = dias.find((x) => x.querySelectorAll(".sem-dots i").length > 0);
  if (!conPedido) {
    click("#sem-next");
    await esperar();
    const ancla = qs("#main .sem-dia.sel");
    conPedido = qsa("#main .sem-dia").find((x) => x !== ancla && x.querySelectorAll(".sem-dots i").length > 0);
  }
  assert.ok(conPedido, "algún día tiene puntos de pedido");
  const dsElegido = conPedido.dataset.ds;
  const esperados = store.pedidos().filter((o) => o.fecha === dsElegido).map((o) => o.id).sort();
  click(conPedido);
  assert.equal(qsa("#main .sem-dia.sel").length, 1, "día elegido resaltado");
  assert.match(qs("#main .sect-titulo").textContent, /\d+ de \w+/, "encabezado del día elegido");
  const cards = qsa("#main .card[data-pedido]");
  assert.ok(cards.length >= 1, "el día elegido tiene pedidos");
  assert.deepEqual(cards.map((c) => c.dataset.pedido).sort(), esperados, "solo los pedidos del día elegido");
  const nombres = cards.map((c) => c.querySelector(".card-titulo").textContent);
  assert.ok(nombres.some((n) => /Rosita|Paco|Lucía|María/.test(n)), "clientes reales, no inventados");
  assert.ok(cards.every((c) => /Pagado|Nuevo|Mensaje|cuotas/.test(c.textContent)), "estado real en cada card");
  assert.ok(!/\d{1,2}:\d{2}/.test(qs("#main .semana").textContent), "sin horas inventadas");

  /* Cambiar de día actualiza: las cards ya no son del día anterior. */
  const otro = qsa("#main .sem-dia").find((x) => x.dataset.ds !== dsElegido && x.querySelectorAll(".sem-dots i").length > 0);
  if (otro) {
    const dsOtro = otro.dataset.ds;
    const esperadosOtro = store.pedidos().filter((o) => o.fecha === dsOtro).map((o) => o.id).sort();
    click(otro);
    assert.deepEqual(qsa("#main .card[data-pedido]").map((c) => c.dataset.pedido).sort(), esperadosOtro, "al cambiar de día se actualizan las cards");
    assert.equal(qsa("#main .sem-dia.sel").length, 1, "sigue un solo día resaltado");
  }

  /* Tocar el día ya elegido lo deselecciona: vuelve al aviso, NUNCA a todas las cards. */
  click(qsa("#main .sem-dia.sel")[0]);
  assert.equal(qsa("#main .sem-dia.sel").length, 0, "día deseleccionado");
  assert.equal(qsa("#main .card[data-pedido]").length, 0, "al deseleccionar no reaparece la semana completa");
  assert.match(qs("#main .nota-vacia").textContent, /Tocá un día/, "vuelve el aviso");

  click("#sem-next");
  assert.ok(qs("#main .semana"), "sigue en vista semanas al navegar");
  assert.equal(qsa("#main .sem-dia").length, 7);

  /* Volver a Calendario conserva la pantalla mensual de siempre. */
  click('#main .agenda-switch-b[data-modo="calendario"]');
  assert.ok(qs("#main .cal"), "vuelve el calendario");
  assert.equal(qs("#main .semana"), null, "franja se oculta");
  assert.deepEqual(errores, []);
});

test("agenda: cambiar de fecha NO relanza la animación de entrada del almanaque", async () => {
  await reiniciar();
  irA("agenda");
  /* El calendario no trae su propia animación de entrada: al repintarse por
     un toque de fecha, el nodo nuevo no debe "abrirse" como la primera vez. */
  assert.ok(qs("#main .cal"), "calendario presente");
  assert.equal(qs("#main .cal").classList.contains("anim-entra"), false,
    "el almanaque no se reanima al cambiar de fecha");
  /* Tocar un día repinta dentro de la misma sección: #main conserva la clase
     de entrada (no se reinicia) y sigue siendo la misma sección. */
  const main = qs("#main");
  assert.ok(main.classList.contains("vista"), "contenedor mantiene su animación de sección");
  const dia = qsa("#main .cal-dia[data-ds]").find((x) => x.querySelector(".dots i"));
  assert.ok(dia, "hay un día con entregas para tocar");
  click(dia);
  assert.equal(vista.seccion, "agenda", "sigue en agenda");
  assert.ok(qs("#main .cal"), "calendario sigue presente tras tocar la fecha");
  assert.equal(qs("#main .cal").classList.contains("anim-entra"), false,
    "sigue sin animación de entrada después del toque");
  assert.ok(main.classList.contains("vista"), "no se relanzó la animación del contenedor");
  assert.deepEqual(errores, []);
});

test("agenda: la vista Semanas muestra indicadores de color en los días con entregas", async () => {
  await reiniciar();
  irA("agenda");
  click('#main .agenda-switch-b[data-modo="semanas"]');
  /* Buscar una semana con datos (las fechas demo son relativas a hoy). */
  let puntos = qsa("#main .sem-dots i");
  if (!puntos.length) { click("#sem-next"); await esperar(); puntos = qsa("#main .sem-dots i"); }
  assert.ok(puntos.length > 0, "la franja tiene puntos indicadores");
  assert.ok(puntos.every((p) => /d-(yellow|orange|blue|green|red|neutral)/.test(p.className)),
    "cada punto tiene un color asignado (antes eran invisibles)");
  const diasCon = qsa("#main .sem-dia.tiene");
  assert.ok(diasCon.length >= 1, "los días con entregas se marcan con la clase 'tiene'");
  assert.ok(diasCon.every((x) => x.querySelector(".sem-dots i")),
    "todo día marcado 'tiene' muestra su indicador");
  assert.deepEqual(errores, []);
});

test("agenda: «Ver otras entregas» pliega con transición de altura sin repintar la sección", async () => {
  await reiniciar();
  vista.calMes = new Date().getMonth(); vista.calAnio = new Date().getFullYear();
  vista.agendaModo = "calendario";
  irA("agenda");
  /* El fold aparece cuando hay un día con entregas seleccionado (como en el video). */
  const dia = qsa("#main .cal-dia[data-ds]").find((x) => x.querySelector(".dots i"));
  assert.ok(dia, "hay día con entregas para seleccionar");
  click(dia);
  const fold = qs("#main .fold-otras");
  assert.ok(fold, "el plegable existe con nodo persistente");
  assert.equal(fold.classList.contains("abierto"), false, "empieza cerrado");
  const panel = qs("#main .fold-panel");
  assert.ok(panel, "el panel con transición de altura está en el DOM (aunque esté cerrado)");
  /* El CSS define la transición real (grid 0fr→1fr), no una aparición seca. */
  const css = fs.readFileSync(path.join(RAIZ, "src/ui/motion.css"), "utf8");
  assert.match(css, /\.fold-otras \.fold-panel[\s\S]*transition:grid-template-rows/,
    "el panel anima su altura con grid-template-rows");
  const btn = qs("#fold-otras");
  click(btn);
  assert.ok(qs("#main .fold-otras").classList.contains("abierto"), "el toggle abre el panel");
  assert.equal(btn.getAttribute("aria-expanded"), "true", "aria-expanded acompaña");
  assert.match(btn.textContent, /Ocultar otras entregas/, "el texto cambia a Ocultar");
  /* No se relanza la animación de entrada de la sección (mismo nodo #main). */
  assert.ok(qs("#main").classList.contains("vista"), "la sección mantiene su animación, no se reinicia");
  click(btn);
  assert.equal(qs("#main .fold-otras").classList.contains("abierto"), false, "segundo toque cierra");
  assert.deepEqual(errores, []);
});

test("agenda: el contenido del día lleva animación corta al tocar una fecha", async () => {
  await reiniciar();
  vista.calMes = new Date().getMonth(); vista.calAnio = new Date().getFullYear();
  vista.agendaModo = "calendario";
  irA("agenda");
  const dia = qsa("#main .cal-dia[data-ds]").find((x) => x.querySelector(".dots i"));
  assert.ok(dia, "hay día con entregas");
  click(dia);
  const detalle = qs("#main .agenda-dia");
  assert.ok(detalle, "el detalle del día existe y es el nodo animado");
  const css = fs.readFileSync(path.join(RAIZ, "src/ui/motion.css"), "utf8");
  assert.match(css, /@keyframes diaCambia/, "existe el keyframe del cambio de día");
  assert.match(css, /\.agenda-dia\{animation:diaCambia 190ms/, "la animación es corta (190 ms, no lenta)");
  /* La animación es local al día: #main no relanza .vista. */
  assert.ok(qs("#main").classList.contains("vista"), "no se relanza la animación de sección");
  assert.deepEqual(errores, []);
});

test("detalle: abanico simétrico, con capas por cercanía sin mover las cartas en el DOM", async () => {
  await reiniciar();
  const items = Array.from({ length: 5 }, (_, i) => ({ nombre: `Artículo ${i + 1}`, precio: 100, qty: 1 }));
  store.boot({ ...store.db(), orders: [
    { id: "abanico", cliente: "Prueba abanico", estado: "new", items },
    { id: "una", cliente: "Prueba una carta", estado: "new", items: items.slice(0, 1) },
  ] });
  irA("pedidos");
  click('#main .card[data-pedido="abanico"]');
  const cards = qsa("#dstack .dcard");
  const valores = key => cards.map(c => c.style.getPropertyValue(key));
  assert.equal(qs("#dstack").style.getPropertyValue("--huecos"), "4");
  assert.deepEqual(valores("--lado"), ["-2", "-1", "0", "1", "2"]);
  assert.deepEqual(valores("--giro"), ["-4deg", "-2deg", "0deg", "2deg", "4deg"]);
  assert.deepEqual(valores("--nivel").map(Number), [1, 2, 3, 4, 5]);
  for (const [i, esperados] of [[0, [5, 4, 3, 2, 1]], [2, [3, 4, 5, 4, 3]], [4, [1, 2, 3, 4, 5]]]) {
    click(cards[i]);
    assert.deepEqual(valores("--nivel").map(Number), esperados);
    assert.deepEqual(qsa('#dstack .dcard[aria-pressed="true"]'), [cards[i]]);
    assert.deepEqual(qsa("#dstack .dcard"), cards);
  }
  click("#hClose");
  await esperar(220);
  click('#main .card[data-pedido="una"]');
  const unica = qs("#dstack .dcard");
  assert.equal(unica.style.getPropertyValue("--lado"), "0");
  assert.equal(unica.style.getPropertyValue("--giro"), "0deg");
  assert.equal(qs("#dstack").style.getPropertyValue("--huecos"), "1", "sin división por cero");
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

test("nav auto-ocultable: gesto abajo oculta, toque y cambio de sección muestran", async () => {
  await reiniciar();
  const nav = qs("#nav");
  assert.equal(nav.classList.contains("oculta"), false, "arranca visible");
  /* jsdom no tiene layout: fijamos la geometría del documento a mano */
  const geo = (y) => {
    Object.defineProperty(w, "scrollY", { value: y, configurable: true, writable: true });
    Object.defineProperty(d.documentElement, "clientHeight", { value: 700, configurable: true });
    Object.defineProperty(d.documentElement, "scrollHeight", { value: 2000, configurable: true });
  };
  const scroll = () => w.dispatchEvent(new w.Event("scroll"));
  const toque = () => w.dispatchEvent(new w.Event("touchstart"));

  geo(100); scroll(); await esperar(20);   // ancla y geometría en y=100
  toque(); geo(140); scroll(); await esperar(20);  // gesto táctil abajo -> oculta
  assert.equal(nav.classList.contains("oculta"), true, "gesto abajo oculta");
  assert.equal(nav.getAttribute("aria-hidden"), "true", "aria-hidden acompaña");
  /* toque nuevo vuelve a mostrar */
  toque(); await esperar(20);
  assert.equal(nav.classList.contains("oculta"), false, "toque muestra");
  /* cambio de sección también muestra */
  toque(); geo(300); scroll(); await esperar(20);
  irA("pedidos"); await esperar(20);
  assert.equal(nav.classList.contains("oculta"), false, "cambio de sección muestra");
  assert.deepEqual(errores, []);
});

test("nav auto-ocultable: rueda abajo oculta y rueda arriba vuelve a mostrar (regresión)", async () => {
  await reiniciar();
  const nav = qs("#nav");
  const geo = (y) => {
    Object.defineProperty(w, "scrollY", { value: y, configurable: true, writable: true });
    Object.defineProperty(d.documentElement, "clientHeight", { value: 700, configurable: true });
    Object.defineProperty(d.documentElement, "scrollHeight", { value: 2000, configurable: true });
  };
  const rueda = (delta) => {
    const e = new w.Event("wheel");
    e.deltaY = delta;
    e.deltaMode = 0;
    w.dispatchEvent(e);
  };
  const scroll = () => w.dispatchEvent(new w.Event("scroll"));

  geo(0); scroll(); await esperar(20);        // ancla en 0
  rueda(160); geo(160); scroll(); await esperar(20);
  assert.equal(nav.classList.contains("oculta"), true, "rueda abajo oculta");
  /* rueda arriba: el ancla NO debe reanclarse antes de que el scroll decida */
  rueda(-160); geo(0); scroll(); await esperar(20);
  assert.equal(nav.classList.contains("oculta"), false, "rueda arriba muestra de nuevo");
  assert.deepEqual(errores, []);
});

test("nav auto-ocultable: transición CSS con transform+opacidad y respeto a reduce-motion", () => {
  const css = fs.readFileSync(path.join(RAIZ, "src/ui/componentes/componentes.css"), "utf8");
  const bloque = css.match(/nav\{[\s\S]*?\}/g) || [];
  const nav = bloque.find((b) => /position:fixed/.test(b)) || "";
  assert.match(nav, /transform:translateY\(0\)/, "estado visible con transform");
  assert.match(nav, /opacity:1/, "opacidad visible");
  assert.match(nav, /transition:transform/, "transición de transform");
  assert.match(css, /nav\.oculta\{[^}]*transform:translateY\([^}]*opacity:0/, "estado oculto baja y se desvanece");
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{\s*nav\{transition:none\}/, "reduce-motion sin transición");
  /* el reservado del contenido no depende del estado de la nav */
  const base = fs.readFileSync(path.join(RAIZ, "src/ui/base.css"), "utf8");
  assert.match(base, /main::after\{[^}]*height:calc\(var\(--nav-h\) \+ 30px\)/, "reserva fija");
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
  /* La versión del caché debe haber cambiado respecto del deploy anterior:
     si queda la vieja, el service worker sirve assets stale y no se ven los cambios. */
  assert.doesNotMatch(sw, /ropa-v2-f0f1-r3/, "la versión de caché no es la stale anterior");
  assert.match(sw, /const CACHE = "ropa-v2-[\w-]+"/, "versión de caché con prefijo de proyecto");
  assert.doesNotMatch(sw, /ropa-v2-integracion-v2final-r4/, "versión de caché actualizada para las fotos demo");
  assert.doesNotMatch(sw, /ropa-v2-nav-auto-ocultable-r5|ropa-v2-demo-fotos-r5/, "versión de caché combinada");
  assert.match(sw, /const CACHE = "ropa-v2-nav-1500ms-" \+ VERSION/, "el nombre de caché sale de VERSION");
  assert.match(sw, /const VERSION = "r31"/, "el caché sube a r31 con «Quitar filtros» que limpia la búsqueda");
  assert.match(sw, /gen=" \+ VERSION/, "los assets se cachean con la generación en la URL");
  assert.doesNotMatch(sw, /-r26"|-r27"/, "la versión de caché no queda en las anteriores");
  assert.doesNotMatch(sw, /-r21"|-r22"|-r23"|-r24"/, "la versión de caché no queda en las anteriores");
  assert.ok(sw.includes("./src/ui/componentes/secciones.css"), "el precache incluye el CSS de secciones");
  assert.ok(sw.includes("./src/nucleo/secciones.js"), "el precache incluye el módulo de secciones");
  assert.ok(sw.includes("./src/ui/componentes/filtros.css"), "el precache incluye el CSS del buscador con filtros");
  assert.ok(sw.includes("./src/nucleo/orden.js"), "el precache incluye el módulo de filtros y orden");
  assert.ok(sw.includes("./src/ui/componentes/picker.css"), "el precache incluye el CSS del selector por sección");
  assert.ok(sw.includes("./src/nucleo/pedido-picker.js"), "el precache incluye el módulo del selector por sección");
  const cssMain = fs.readFileSync(path.join(RAIZ, "src/main.css"), "utf8");
  assert.match(cssMain, /base\.css\?v=3/, "el recorte del deslizo de la agenda entra con versión propia");
  assert.match(cssMain, /componentes\.css\?v=5/, "los estilos nuevos del inventario por secciones entran con versión propia");
  assert.match(cssMain, /filtros\.css\?v=1/, "los estilos del buscador con filtros entran con versión propia");
  assert.match(cssMain, /picker\.css\?v=1/, "los estilos del selector del pedido por sección entran con versión propia");
  assert.match(cssMain, /motion\.css\?v=3/, "las animaciones nuevas de la agenda entran con versión propia");
  assert.doesNotMatch(sw, /ropa-v2-nav-90s-r19|ropa-v2-paco-corbata-r18|ropa-v2-nav-2000ms-toast-r17|ropa-v2-nav-2500ms-toast-r16|ropa-v2-pedido-cantidad-r14|ropa-v2-toast-r15|ropa-v2-nav-reaparicion-2500ms-r15/, "la versión de caché no queda en la de publicaciones anteriores");
  assert.doesNotMatch(sw, /ropa-v2-nav-pausa-r11/, "la caché publicada debe cambiar para servir el CSS del calendario");
  assert.ok(sw.includes("./src/ui/nav-scroll.js"), "el precache incluye la lógica de nav");
  assert.match(sw, /\.\/src\/main\.js/);
  assert.match(sw, /\.\/index\.html/);
  for (const fijo of ["src/estado/store.js", "src/nucleo/pedidos.js", "src/ui/componentes/componentes.css"]) {
    assert.ok(sw.includes("./" + fijo), "el precache incluye " + fijo);
  }
  /* Las fotos de muestra deben estar en el precache para verse tras recargar. */
  for (const foto of ["vestido", "campera", "jean", "bolso", "buzo"]) {
    assert.ok(sw.includes("./fotos/" + foto + ".jpg"), "el precache incluye la foto " + foto);
  }
});

test("editor: pedido de Paco abre con Camisa blanca + Corbata ($1,250) y no Medias lanas (regresión)", async () => {
  await reiniciar();
  irA("pedidos");
  // d2 = Paco, Camisa blanca ($950) + Corbata ($300) → $1,250
  click('#main .card[data-pedido="d2"]');
  await esperar();
  assert.match(qs("#hoja-in").textContent, /\$1,250/, "detalle muestra $1,250");
  click("#hEdit");
  await esperar();
  assert.match(qs("#hoja-in").textContent, /Editar pedido/);
  assert.equal(qs("#ftotal").textContent, "$1,250", "el editor conserva el total del pedido de Paco");
  const picksOn = qsa("#mode-inv .pk-fila.on .pk-txt b").map((n) => n.textContent.trim());
  assert.deepEqual(picksOn, ["Camisa blanca", "Corbata"], "los productos seleccionados son Camisa blanca y Corbata");
  assert.ok(!picksOn.includes("Medias lanas"), "NO aparece Medias lanas");
  // los snapshots por productoId son correctos (Corbata $300, no $250 de Medias)
  const pedido = store.pedidoPorId("d2");
  assert.deepEqual(pedido.items.map((i) => i.productoId), ["di2", "di6"]);
  assert.deepEqual(pedido.items.map((i) => i.precio), [950, 300]);
  assert.deepEqual(errores, []);
});

test("editor: pedido de Rosita abre con 2× Medias lanas y Total $500, y guardar no lo baja (regresión)", async () => {
  await reiniciar();
  irA("pedidos");
  // d4 = Rosita, 2× Medias lanas ($250 c/u) → $500
  click('#main .card[data-pedido="d4"]');
  await esperar();
  assert.match(qs("#hoja-in").textContent, /\$500/, "detalle muestra $500");
  click("#hEdit");
  await esperar();
  // el editor reconstruye la cantidad desde orig.items
  assert.match(qs("#hoja-in").textContent, /Editar pedido/);
  assert.equal(qs("#ftotal").textContent, "$500", "el editor NO baja el total a $250");
  const stepper = qs("#mode-inv .qtystep b");
  assert.ok(stepper, "la tarjeta seleccionada muestra el stepper de cantidad");
  assert.equal(stepper.textContent.trim(), "2", "muestra la cantidad ×2");
  const pickOn = qsa("#mode-inv .pk-fila.on");
  assert.equal(pickOn.length, 1, "una sola fila de producto, con cantidad 2");
  // guardar solo el estado: el pedido conserva cantidad y total
  click("#saveBtn");
  await esperar();
  const despues = store.pedidoPorId("d4");
  assert.equal(despues.items.length, 1);
  assert.equal(despues.items[0].qty, 2, "qty conservado tras guardar");
  assert.equal(despues.items[0].precio, 250);
  assert.deepEqual(errores, []);
});

/* ---- regresión: aviso de error no queda flotando sobre el header ---- */
function dispararErrorSinProductos() {
  irA("pedidos");
  click('#fab');
  qs("#f-cliente").value = "Cliente de prueba";
  click("#saveBtn");
  assert.match(qs("#toast").textContent, /Agregá al menos un producto/, "aparece el aviso de error");
  assert.equal(qs("#toast").classList.contains("mostrar"), true, "aviso visible");
}

test("toast: cerrar la hoja quita el aviso y cancela el temporizador", async () => {
  await reiniciar();
  dispararErrorSinProductos();
  click("#cancelar");
  await esperar();
  assert.equal(qs("#confirmar").classList.contains("abierta"), true, "pide confirmación por los cambios sin guardar");
  click("#cv-yes");
  await esperar(240);
  assert.equal(qs("#toast").classList.contains("mostrar"), false, "aviso oculto al cerrar la hoja");
  await esperar(4300);
  assert.equal(qs("#toast").classList.contains("mostrar"), false, "no reaparece al vencer el timer viejo");
  assert.deepEqual(errores, []);
});

test("toast: cambiar de sección quita el aviso y deja el header libre", async () => {
  await reiniciar();
  dispararErrorSinProductos();
  click("#cancelar");
  await esperar(240);
  /* aviso nuevo sobre una sección sin hoja, luego cambiar de sección */
  irA("inventario");
  assert.equal(qs("#toast").classList.contains("mostrar"), false, "sin aviso en Inventario");
  assert.equal(document.body.style.getPropertyValue("--toast-space"), "0px", "sin espacio reservado para toast");
  await esperar(4300);
  assert.equal(qs("#toast").classList.contains("mostrar"), false, "no reaparece al vencer el timer viejo");
  assert.deepEqual(errores, []);
});

test("toast: sigue apareciendo y autocerrando con el único temporizador", async () => {
  await reiniciar();
  dispararErrorSinProductos();
  await esperar(4400);
  assert.equal(qs("#toast").classList.contains("mostrar"), false, "el aviso se cierra solo");
  assert.deepEqual(errores, []);
});

/* ---------- Agenda: los tres recambios que antes aparecían de golpe ---------- */
test("agenda: el switch Calendario ↔ Semanas anima solo la vista que entra, no #main", async () => {
  await reiniciar();
  irA("agenda");
  const main = qs("#main");
  assert.equal(main.dataset.agendaModo, "calendario", "la sección recuerda la vista pintada");

  /* Semanas: la vista que entra trae el keyframe corto con dirección de vista. */
  click('#main .agenda-switch-b[data-modo="semanas"]');
  const semana = qs("#main .semana");
  assert.ok(semana, "vista Semanas montada");
  assert.ok(semana.classList.contains("agenda-anim"), "la vista que entra se anima");
  assert.equal(semana.dataset.dir, "vista", "deslizo de cambio de vista, no de dirección de semana");
  assert.equal(qs("#main .cal"), null, "la otra vista se va: es un recambio, no dos capas encimadas");
  assert.ok(main.classList.contains("vista"), "#main conserva su animación de sección sin relanzarla");

  /* Y de vuelta: ahora se anima el almanaque. */
  click('#main .agenda-switch-b[data-modo="calendario"]');
  const cal = qs("#main .cal");
  assert.ok(cal.classList.contains("agenda-anim"), "el almanaque entra animado");
  assert.equal(cal.dataset.dir, "vista");

  /* Tocar la vista que ya está activa no repinta ni anima de nuevo. */
  click('#main .agenda-switch-b[data-modo="calendario"]');
  assert.equal(qs("#main .cal"), cal, "tocar la vista activa no rehace el almanaque");
  assert.deepEqual(errores, []);
});

test("agenda: las flechas de mes animan la grilla con dirección y sin rehacer #main", async () => {
  await reiniciar();
  irA("agenda");
  const cal = qs("#main .cal");
  const grid = qs("#main .cal-grid");
  const titulo = qs("#cal-titulo").textContent;

  click("#cal-next");
  assert.equal(qs("#main .cal-grid"), grid, "la grilla es el mismo nodo: se reescribe en el sitio");
  assert.equal(qs("#main .cal"), cal, "#main no se rehízo al cambiar de mes");
  assert.ok(grid.classList.contains("agenda-anim"), "la grilla nueva entra animada");
  assert.equal(grid.dataset.dir, "prox", "mes siguiente desliza desde la derecha");
  assert.notEqual(qs("#cal-titulo").textContent, titulo, "el título del mes acompaña");

  click("#cal-prev");
  assert.equal(qs("#main .cal-grid"), grid, "sigue el mismo nodo de grilla");
  assert.equal(grid.dataset.dir, "prev", "mes anterior desliza desde la izquierda");

  /* Los días siguen operativos después del recambio en el sitio. */
  click(qsa("#main .cal-dia[data-ds]")[3]);
  assert.equal(vista.seccion, "agenda", "sigue en agenda");
  assert.equal(qsa("#main .cal-dia.sel").length, 1, "el día elegido se pinta tras cambiar de mes");
  assert.deepEqual(errores, []);
});

test("agenda: las flechas de semana animan la franja con dirección y la dejan operativa", async () => {
  await reiniciar();
  irA("agenda");
  click('#main .agenda-switch-b[data-modo="semanas"]');
  const franja = qs("#main .sem-franja");
  const titulo = qs("#sem-titulo").textContent;

  click("#sem-next");
  assert.equal(qs("#main .sem-franja"), franja, "la franja es el mismo nodo: se reescribe en el sitio");
  assert.ok(franja.classList.contains("agenda-anim"), "la semana nueva entra animada");
  assert.equal(franja.dataset.dir, "prox", "semana siguiente desliza desde la derecha");
  assert.notEqual(qs("#sem-titulo").textContent, titulo, "el rango de la semana acompaña");
  assert.equal(qsa("#main .sem-dia").length, 7, "siete días tras el cambio");

  click("#sem-prev");
  assert.equal(qs("#main .sem-franja"), franja, "sigue el mismo nodo de franja");
  assert.equal(franja.dataset.dir, "prev", "semana anterior desliza desde la izquierda");

  /* La franja recableada responde: tocar un día muestra el bloque y las cards. */
  const con = qsa("#main .sem-dia").find((x) => x.querySelectorAll(".sem-dots i").length);
  if (con) {
    click(con);
    assert.equal(qsa("#main .sem-dia.sel").length, 1, "día elegido tras cambiar de semana");
    const ds = con.dataset.ds;
    const esperados = store.pedidos().filter((o) => o.fecha === ds).map((o) => o.id).sort();
    assert.deepEqual(qsa("#main .card[data-pedido]").map((c) => c.dataset.pedido).sort(), esperados,
      "las tarjetas del día siguen vivas tras el recambio");
  }
  assert.deepEqual(errores, []);
});

test("animaciones: agenda y chips usan solo transform/opacity, 150-320 ms y respetan reduce-motion", () => {
  const motion = fs.readFileSync(path.join(RAIZ, "src/ui/motion.css"), "utf8");
  const comp = fs.readFileSync(path.join(RAIZ, "src/ui/componentes/componentes.css"), "utf8");

  /* Agenda: keyframe de recambio, corto y compuesto. */
  const kf = /@keyframes agendaCambia\{([\s\S]*?)\n\}/.exec(motion);
  assert.ok(kf, "existe el keyframe del recambio de agenda");
  assert.match(kf[1], /opacity/, "anima opacidad");
  assert.match(kf[1], /translateX/, "anima traslado");
  assert.doesNotMatch(kf[1], /height|width|margin|padding|top:|left:/, "nada que fuerce reflow");
  const uso = /\.agenda-anim\{animation:agendaCambia (\d+)ms/.exec(motion);
  assert.ok(uso, "el recambio declara su duración");
  const ms = Number(uso[1]);
  assert.ok(ms >= 150 && ms <= 320, "duración dentro de 150-320 ms (" + ms + ")");
  assert.match(motion, /\.agenda-anim\[data-dir="prox"\]\{--ag-x:30px\}/, "dirección adelante");
  assert.match(motion, /\.agenda-anim\[data-dir="prev"\]\{--ag-x:-30px\}/, "dirección atrás");
  assert.match(motion, /@media \(prefers-reduced-motion:reduce\)\{[\s\S]*?\.agenda-anim\{animation:none/,
    "reduce-motion apaga el recambio");
  /* La animación no esconde el contenido: entra, no queda apagada. */
  assert.match(motion, /\.agenda-anim\{animation:agendaCambia 220ms[^}]*both/, "queda en su estado final");

  /* Chips: el estado activo entra con el tono de las tarjetas. */
  const kfChip = /@keyframes chipOn\{([\s\S]*?)\n\}/.exec(comp);
  assert.ok(kfChip, "existe el keyframe del chip activo");
  assert.match(kfChip[1], /opacity/, "anima opacidad");
  assert.match(kfChip[1], /translateY\(2px\) scale\(\.96\)/, "sube y escala como el stagger");
  assert.doesNotMatch(kfChip[1], /height|margin|padding/, "sin reflow");
  const usoChip = /\.chip\.on\{animation:chipOn (\d+)ms/.exec(comp);
  assert.ok(usoChip, "el chip activo declara su duración");
  const msChip = Number(usoChip[1]);
  assert.ok(msChip >= 150 && msChip <= 320, "duración dentro de 150-320 ms (" + msChip + ")");
  assert.match(comp, /@media \(prefers-reduced-motion:reduce\)\{\s*\.chip\.on,\.chip\.on::before\{animation:none\}/,
    "reduce-motion apaga el chip animado");
  assert.match(comp, /\.chip\.on\{[^}]*background:var\(--grad-acc\)/, "el chip activo conserva su relleno");
});

test("agenda: el deslizo de mes/semana no desborda a 320 px (main recorta con clip, no hidden)", () => {
  const base = fs.readFileSync(path.join(RAIZ, "src/ui/base.css"), "utf8");
  const cssMain = fs.readFileSync(path.join(RAIZ, "src/main.css"), "utf8");
  /* Medido en el Chrome del proyecto a 320 px: durante agendaCambia con
     data-dir="prox" la grilla asoma ~11 px fuera del viewport y el
     scrollWidth del documento subía de 305 a 316. El clip en #main lo corta
     sin crear contexto de scroll ni tocar animaciones ni márgenes. */
  assert.match(base, /main\{[^}]*overflow-x:clip/, "el bloque de #main recorta el desborde horizontal");
  const bloqueMain = /main\{([^}]*)\}/.exec(base);
  assert.ok(bloqueMain, "existe el bloque base de main");
  assert.doesNotMatch(bloqueMain[1], /overflow(-x)?:hidden/, "clip, no hidden: sin contexto de scroll ni corte de focos");
  assert.match(cssMain, /base\.css\?v=3/, "el recorte entra con versión propia del CSS");
});

test("animaciones: los chips de Pedidos e Historial se animan al filtrar y no se quedan apagados", async () => {
  await reiniciar();
  irA("pedidos");
  click('#chips .chip[data-k="paid"]');
  const chip = qs('#chips .chip[data-k="paid"]');
  assert.ok(chip.classList.contains("on"), "el chip elegido queda activo");
  assert.equal(chip.getAttribute("aria-pressed"), "true", "aria-pressed acompaña");
  assert.doesNotMatch(chip.getAttribute("style") || "", /opacity|transform/, "sin estilos inline que pisen la animación");
  irA("historial");
  const ch = qsa("#main .chip");
  if (ch.length) {
    click(ch[ch.length - 1]);
    assert.equal(qsa("#main .chip.on").length, 1, "un solo autor activo en Historial");
  }
  assert.deepEqual(errores, []);
});
/* ---------- Inventario por secciones (decisión B aprobada por Nico) ---------- */
test("secciones: el inventario se agrupa por cajón, con contador y «Sin sección» al final", async () => {
  await reiniciar();
  irA("inventario");
  const cajones = qsa("#main .sec");
  assert.equal(cajones.length, 3, "dos secciones + Sin sección");
  assert.deepEqual(cajones.map((c) => c.querySelector(".sec-nombre").textContent),
    ["Dama · verano", "Hombre · básicos", "Sin sección"]);
  assert.deepEqual(cajones.map((c) => c.querySelector(".sec-cnt").textContent), ["2", "2", "2"]);
  assert.equal(qsa("#main .inv-card").length, 6, "6 productos demo");
  assert.equal(qsa("#stats .stat").length, 2, "productos y secciones arriba");
  assert.deepEqual(errores, []);
});

test("secciones: plegar un cajón deja de mostrar sus prendas y no repinta la pantalla", async () => {
  await reiniciar();
  irA("inventario");
  const toggle = qs("#main .sec:nth-of-type(2) .sec-toggle");
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  click(toggle);
  const sec = qs("#main .sec:nth-of-type(2)");
  assert.equal(sec.classList.contains("plegada"), true, "el cajón queda plegado");
  assert.equal(toggle.getAttribute("aria-expanded"), "false", "el botón anuncia el estado");
  assert.equal(qs("#main .sec:nth-of-type(2) .sec-body").hidden, true, "el cuerpo se oculta");
  assert.equal(qsa("#main .sec").length, 3, "los cajones no se repintan ni desaparecen");
  click(qs("#main .sec:nth-of-type(2) .sec-toggle"));
  assert.equal(qs("#main .sec:nth-of-type(2) .sec-body").hidden, false);
  assert.deepEqual(errores, []);
});

test("secciones: crear una sección desde la hoja la deja en el inventario y en el historial", async () => {
  await reiniciar();
  irA("inventario");
  click('[data-acc="secciones"]');
  await esperar();
  qs("#sec-nombre").value = "Nena · fiesta";
  click('[data-acc="nueva"]');
  await esperar();
  assert.equal(store.secciones().length, 3, "la sección nueva queda en el store");
  assert.equal(store.secciones()[2].nombre, "Nena · fiesta");
  assert.equal(qs("#hoja").classList.contains("abierta"), true, "la hoja sigue abierta para seguir ordenando");
  assert.ok(qsa("#main .sec-nombre").some((n) => n.textContent === "Nena · fiesta"), "el cajón aparece atrás");
  assert.equal(store.log().at(-1).action, "sec_new");
  assert.deepEqual(errores, []);
});

test("secciones: nombre repetido no crea nada y el error queda en la hoja", async () => {
  await reiniciar();
  irA("inventario");
  click('[data-acc="secciones"]');
  await esperar();
  qs("#sec-nombre").value = "dama · VERANO";
  click('[data-acc="nueva"]');
  await esperar();
  assert.equal(store.secciones().length, 2, "no se duplica la sección");
  assert.match(qs("#hoja-in").textContent, /Ya tenés una sección con ese nombre/);
  assert.equal(qs("#sec-nombre").getAttribute("aria-invalid"), "true", "el campo marca el error");
  assert.deepEqual(errores, []);
});

test("secciones: renombrar cambia el nombre en el cajón y no mueve prendas", async () => {
  await reiniciar();
  irA("inventario");
  click('[data-acc="secciones"]');
  await esperar();
  click('#hoja-in .sec-fila[data-id="ds1"] [data-sec="renombrar"]');
  await esperar();
  qs("#hoja-in #sec-nombre").value = "Dama · invierno";
  click('#hoja-in [data-acc="guardar"]');
  await esperar();
  assert.equal(store.seccionPorId("ds1").nombre, "Dama · invierno");
  assert.equal(store.productoPorId("di1").seccionId, "ds1", "las prendas no se mueven");
  assert.ok(qsa("#main .sec-nombre").some((n) => n.textContent === "Dama · invierno"));
  assert.deepEqual(errores, []);
});

test("secciones: borrar una sección pasa sus prendas a «Sin sección» y no borra productos", async () => {
  await reiniciar();
  irA("inventario");
  click('[data-acc="secciones"]');
  await esperar();
  click('#hoja-in .sec-fila[data-id="ds1"] [data-sec="borrar"]');
  await esperar();
  assert.equal(qs("#confirmar").classList.contains("abierta"), true, "pide confirmación");
  assert.match(qs("#cv-p").textContent, /2 prendas pasan a “Sin sección”/);
  click("#cv-yes");
  await esperar();
  assert.equal(store.db().inventory.length, 6, "no se borra ningún producto");
  assert.equal(store.seccionPorId("ds1"), null, "la sección sí se borra");
  const sinSeccion = qsa("#main .sec").find((s) => s.querySelector(".sec-nombre").textContent === "Sin sección");
  assert.equal(sinSeccion.querySelector(".sec-cnt").textContent, "4", "cuatro prendas quedan sin sección");
  assert.deepEqual(errores, []);
});

test("secciones: cancelar el borrado no toca nada", async () => {
  await reiniciar();
  irA("inventario");
  click('[data-acc="secciones"]');
  await esperar();
  click('#hoja-in .sec-fila[data-id="ds2"] [data-sec="borrar"]');
  await esperar();
  click("#cv-no");
  await esperar();
  assert.equal(store.seccionPorId("ds2").nombre, "Hombre · básicos", "la sección sigue");
  assert.equal(store.productoPorId("di2").seccionId, "ds2", "las prendas siguen en su cajón");
  assert.deepEqual(errores, []);
});

test("secciones: asignar prendas desde la hoja mueve solo las marcadas", async () => {
  await reiniciar();
  irA("inventario");
  click('[data-acc="secciones"]');
  await esperar();
  click('#hoja-in .sec-fila[data-id="ds1"] [data-sec="abrir"]');
  await esperar();
  const marcas = qsa("#hoja-in [data-pick]");
  assert.equal(marcas.length, 6, "se listan todas las prendas");
  assert.deepEqual(marcas.filter((c) => c.checked).map((c) => c.dataset.pick), ["di1", "di3"], "arranca con las que ya están");
  marcas.find((c) => c.dataset.pick === "di5").checked = true;
  marcas.find((c) => c.dataset.pick === "di6").checked = true;
  marcas.find((c) => c.dataset.pick === "di3").checked = false;
  click('#hoja-in [data-acc="aplicar"]');
  await esperar();
  assert.equal(store.productoPorId("di5").seccionId, "ds1");
  assert.equal(store.productoPorId("di6").seccionId, "ds1");
  assert.equal(store.productoPorId("di3").seccionId, null, "la desmarcada vuelve a Sin sección");
  assert.equal(store.productoPorId("di2").seccionId, "ds2", "las de otras secciones no cambian");
  assert.equal(store.productoPorId("di4").seccionId, "ds2");
  assert.deepEqual(errores, []);
});

test("secciones: el editor de la prenda deja elegir la sección y la guarda", async () => {
  await reiniciar();
  irA("inventario");
  click('#main .inv-card[data-id="di5"] [data-act="edit"]');
  await esperar();
  const sel = qs("#inv-sec");
  assert.ok(sel, "el editor tiene selector de sección");
  assert.equal(sel.value, "", "la prenda suelta arranca en Sin sección");
  sel.value = "ds2";
  sel.dispatchEvent(new w.Event("change"));
  click("#inv-save");
  await esperar(240);
  assert.equal(store.productoPorId("di5").seccionId, "ds2", "la sección elegida se guarda");
  assert.equal(store.db().inventory.length, 6, "no se duplica ni se pierde nada");
  assert.deepEqual(errores, []);
});

test("secciones: buscar filtra dentro de los cajones y deja solo los que tienen coincidencias", async () => {
  await reiniciar();
  irA("inventario");
  qs("#search").value = "vestido";
  qs("#search").dispatchEvent(new w.Event("input"));
  await esperar();
  assert.equal(qsa("#main .sec").length, 1, "solo el cajón con la coincidencia");
  assert.equal(qs("#main .sec-nombre").textContent, "Dama · verano");
  assert.equal(qsa("#main .inv-card").length, 1);
  assert.equal(qsa("#main .sec-acc").length, 0, "mientras se busca no se muestran las acciones de la sección");
  qs("#search").value = "zzz";
  qs("#search").dispatchEvent(new w.Event("input"));
  await esperar();
  assert.match(qs("#main").textContent, /Sin resultados/);
  qs("#search").value = "";
  qs("#search").dispatchEvent(new w.Event("input"));
  await esperar();
  assert.equal(qsa("#main .sec").length, 3, "al vaciar la búsqueda vuelven los tres cajones");
  assert.deepEqual(errores, []);
});

test("secciones: los blancos táctiles del inventario por secciones llegan a 44 px", () => {
  const css = fs.readFileSync(path.join(RAIZ, "src/ui/componentes/secciones.css"), "utf8");
  const cssMain = fs.readFileSync(path.join(RAIZ, "src/main.css"), "utf8");
  assert.ok(cssMain.includes("secciones.css"), "la hoja de secciones entra en main.css");
  for (const regla of [".sec-toggle{", ".sec-acc{", ".hoja-cab .hbtn{", ".sec-fila-abre{"]) {
    const bloque = new RegExp(regla.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^}]*)").exec(css);
    assert.ok(bloque, "existe la regla " + regla);
    const alto = /(?:min-)?height:(\d+)px/.exec(bloque[1]);
    assert.ok(alto && Number(alto[1]) >= 44, regla + " con blanco táctil ≥44 px");
  }
});

/* ---------- Inventario: buscador con filtros y orden (decisión 1 aprobada por Nico) ---------- */
test("filtros: el inventario filtra por categoría con contador y no toca los datos", async () => {
  await reiniciar();
  irA("inventario");
  const chips = qsa("#main .chip-cat");
  assert.deepEqual(chips.map((c) => c.textContent.replace(/\d+$/, "")),
    ["Todas", "Vestido", "Pantalón / Leggin", "Camisa / Blusa", "Abrigo / Chaqueta", "Medias", "Accesorio / Otro"],
    "un chip por categoría con prendas, en el orden del catálogo");
  assert.equal(chips[0].classList.contains("on"), true, "arranca en Todas");
  assert.equal(qsa("#main .inv-card").length, 6);
  click('#main .chip-cat[data-inv-cat="vestido"]');
  assert.equal(qsa("#main .inv-card").length, 1, "queda una sola prenda");
  assert.equal(qs("#main .inv-card").getAttribute("data-id"), "di1");
  assert.equal(qs('#main .chip-cat[data-inv-cat="vestido"]').getAttribute("aria-pressed"), "true");
  assert.match(qs("#inv-resumen").textContent, /1 producto/);
  assert.match(qs("#inv-resumen").textContent, /Vestido/);
  assert.equal(qsa("#main .sec").length, 1, "solo el cajón que tiene la coincidencia");
  assert.equal(store.db().inventory.length, 6, "filtrar no borra ni mueve nada");
  click('#main .chip-cat[data-inv-cat="todas"]');
  assert.equal(qsa("#main .inv-card").length, 6, "volver a Todas muestra todo");
  assert.deepEqual(errores, []);
});

test("filtros: el orden por precio y A–Z reordena dentro de cada cajón", async () => {
  await reiniciar();
  irA("inventario");
  /* el orden actúa dentro de cada sección: los cajones siguen el orden de la clienta */
  const porCajon = () => qsa("#main .sec").map((s) => ({
    nombre: s.querySelector(".sec-nombre").textContent,
    precios: [...s.querySelectorAll(".inv-card .inv-cuerpo p")].map((p) => Number(p.textContent.replace(/[^\d]/g, ""))),
    nombres: [...s.querySelectorAll(".inv-card .inv-cuerpo h4")].map((h) => h.textContent.toLowerCase()),
  }));
  const sel = qs("#inv-orden");
  assert.ok(sel, "hay selector de orden");
  assert.equal(sel.value, "alta", "arranca en el orden de siempre");
  sel.value = "precio-asc";
  sel.dispatchEvent(new w.Event("change"));
  await esperar();
  for (const g of porCajon()) {
    assert.deepEqual(g.precios, [...g.precios].sort((a, b) => a - b), "menor a mayor en " + g.nombre);
  }
  const sinSeccion = porCajon().find((g) => g.nombre === "Sin sección");
  assert.deepEqual(sinSeccion.precios, [250, 300], "Medias lanas antes que Corbata");
  qs("#inv-orden").value = "precio-desc";
  qs("#inv-orden").dispatchEvent(new w.Event("change"));
  await esperar();
  for (const g of porCajon()) {
    assert.deepEqual(g.precios, [...g.precios].sort((a, b) => b - a), "mayor a menor en " + g.nombre);
  }
  assert.deepEqual(porCajon().find((g) => g.nombre === "Hombre · básicos").precios, [3200, 950], "Abrigo largo primero");
  qs("#inv-orden").value = "az";
  qs("#inv-orden").dispatchEvent(new w.Event("change"));
  await esperar();
  for (const g of porCajon()) {
    assert.deepEqual(g.nombres, [...g.nombres].sort((a, b) => a.localeCompare(b, "es")), "alfabético en " + g.nombre);
  }
  assert.deepEqual(porCajon().find((g) => g.nombre === "Dama · verano").nombres, ["pantalón negro", "vestido floral"]);
  assert.equal(qsa("#main .inv-card").length, 6, "no se pierde ninguna prenda al ordenar");
  assert.equal(store.db().inventory[0].id, "di1", "el orden es de pantalla: el inventario guardado no cambia");
  assert.deepEqual(errores, []);
});

test("filtros: «más usados» pone arriba la prenda que entra en más pedidos", async () => {
  await reiniciar();
  irA("inventario");
  qs("#inv-orden").value = "usados";
  qs("#inv-orden").dispatchEvent(new w.Event("change"));
  await esperar();
  const ids = qsa("#main .inv-card").map((c) => c.dataset.id);
  /* demo: Medias lanas suma 3 unidades en dos pedidos y queda primera en «Sin sección»;
     en Hombre · básicos el Abrigo largo (1 pedido) va antes que la Camisa (0). */
  const sinSeccion = qs('#main .sec[data-sec-grupo="sin"]');
  assert.equal(sinSeccion.querySelector(".inv-card").dataset.id, "di5", "Medias lanas es la más usada");
  const hombre = qs('#main .sec[data-sec-grupo="ds2"]');
  assert.deepEqual([...hombre.querySelectorAll(".inv-card")].map((c) => c.dataset.id), ["di4", "di2"]);
  assert.equal(ids.length, 6);
  assert.deepEqual(errores, []);
});

test("vista alterna: la lista compacta muestra foto mini, sección y precio, y no cambia los datos", async () => {
  await reiniciar();
  irA("inventario");
  assert.equal(qsa("#main .inv-fila").length, 0, "arranca en grilla");
  const boton = qs("#inv-vista");
  assert.equal(boton.getAttribute("aria-pressed"), "false");
  click(boton);
  assert.equal(qsa("#main .inv-fila").length, 6, "una fila por prenda");
  assert.equal(qsa("#main .inv-card").length, 0, "la grilla se reemplaza, no se duplica");
  const fila = qsa("#main .inv-fila")[0];
  assert.ok(fila.querySelector(".fila-mini img"), "foto mini en la fila");
  assert.ok(fila.querySelector(".fila-txt b").textContent);
  assert.match(fila.querySelector(".fila-txt small").textContent, /Dama · verano/, "la fila dice de qué sección es");
  assert.match(fila.querySelector(".fila-precio").textContent, /\$/);
  assert.equal(qs("#inv-vista").getAttribute("aria-pressed"), "true");
  assert.match(qs("#inv-vista").textContent, /Grilla/, "el botón ofrece volver a la grilla");
  click("#inv-vista");
  assert.equal(qsa("#main .inv-card").length, 6, "volver a grilla");
  assert.equal(store.db().inventory.length, 6);
  assert.deepEqual(errores, []);
});

test("vista alterna: la lista respeta el filtro y la búsqueda", async () => {
  await reiniciar();
  irA("inventario");
  click("#inv-vista");
  click('#main .chip-cat[data-inv-cat="media"]');
  const filas = qsa("#main .inv-fila");
  assert.equal(filas.length, 1, "el filtro también aplica en lista");
  assert.equal(filas[0].getAttribute("data-id"), "di5");
  qs("#search").value = "vestido";
  qs("#search").dispatchEvent(new w.Event("input"));
  await esperar();
  assert.match(qs("#main").textContent, /Sin resultados/, "un filtro que no coincide con la búsqueda avisa");
  qs("#search").value = "";
  qs("#search").dispatchEvent(new w.Event("input"));
  await esperar();
  assert.equal(qsa("#main .inv-fila").length, 1, "la lista sigue en pie tras buscar");
  assert.deepEqual(errores, []);
});

test("filtros: sin coincidencias el vacío explica y «Quitar filtros» vuelve a todo", async () => {
  await reiniciar();
  irA("inventario");
  click('#main .chip-cat[data-inv-cat="media"]');
  qs("#search").value = "vestido";
  qs("#search").dispatchEvent(new w.Event("input"));
  await esperar();
  assert.match(qs("#main").textContent, /Sin resultados/);
  assert.match(qs("#main").textContent, /Medias/, "dice qué filtro está puesto");
  const limpiar = qs('[data-acc="limpiar-filtros"]');
  assert.ok(limpiar, "hay atajo para quitar los filtros");
  click(limpiar);
  assert.equal(qs("#inv-orden").value, "alta", "el orden vuelve al de siempre");
  assert.equal(qs('#main .chip-cat[data-inv-cat="todas"]').classList.contains("on"), true);
  assert.equal(qs("#search").value, "", "el buscador también se vacía solo");
  assert.equal(vista.busqueda, "", "y el estado de búsqueda queda limpio");
  await esperar();
  assert.equal(qsa("#main .inv-card").length, 6, "vuelven las seis prendas sin borrar nada a mano");
  assert.deepEqual(errores, []);
});

test("filtros: con búsqueda y orden puestos, «Quitar filtros» deja el inventario completo", async () => {
  await reiniciar();
  irA("inventario");
  qs("#inv-orden").value = "az";
  qs("#inv-orden").dispatchEvent(new w.Event("change"));
  qs("#search").value = "zzz";
  qs("#search").dispatchEvent(new w.Event("input"));
  await esperar();
  assert.match(qs("#main").textContent, /Sin resultados/);
  assert.match(qs("#main").textContent, /zzz/);
  const limpiar = qs('[data-acc="limpiar-filtros"]');
  assert.ok(limpiar, "hay atajo para quitar los filtros");
  click(limpiar);
  await esperar();
  assert.equal(qs("#search").value, "", "el campo de búsqueda queda vacío");
  assert.equal(vista.busqueda, "");
  assert.equal(qs("#inv-orden").value, "alta", "el orden vuelve al de siempre");
  assert.equal(qsa("#main .inv-card").length, 6, "se ve el inventario entero");
  assert.equal(qsa("#main .vacio").length, 0, "ya no queda el vacío de «Sin resultados»");
  assert.deepEqual(errores, []);
});

test("filtros: el buscador del inventario dice «Buscar prenda» y los blancos táctiles llegan a 44 px", async () => {
  await reiniciar();
  irA("inventario");
  assert.equal(qs("#search").placeholder, "Buscar prenda…");
  irA("pedidos");
  assert.equal(qs("#search").placeholder, "Buscar…", "en el resto de las secciones no cambia");
  const css = fs.readFileSync(path.join(RAIZ, "src/ui/componentes/filtros.css"), "utf8");
  const cssMain = fs.readFileSync(path.join(RAIZ, "src/main.css"), "utf8");
  assert.ok(cssMain.includes("filtros.css"), "la hoja de filtros entra en main.css");
  for (const regla of [".invtools-orden{", ".invtools-vista{", ".inv-fila{", ".inv-fila .inv-acciones button{"]) {
    const bloque = new RegExp(regla.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^}]*)").exec(css);
    assert.ok(bloque, "existe la regla " + regla);
    const alto = /(?:min-)?height:(\d+)px/.exec(bloque[1]);
    assert.ok(alto && Number(alto[0].match(/\d+/)[0]) >= 44, regla + " con blanco táctil ≥44 px");
  }
  assert.deepEqual(errores, []);
});
