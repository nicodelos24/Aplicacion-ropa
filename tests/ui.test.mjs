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
  assert.match(sw, /const CACHE = "ropa-v2-nav-reaparicion-2500ms-r15"/, "el caché se refresca con el cambio de reaparición de la nav");
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
  const pickOn = qsa("#mode-inv .pick.on");
  assert.equal(pickOn.length, 1, "una sola tarjeta de producto, con cantidad 2");
  // guardar solo el estado: el pedido conserva cantidad y total
  click("#saveBtn");
  await esperar();
  const despues = store.pedidoPorId("d4");
  assert.equal(despues.items.length, 1);
  assert.equal(despues.items[0].qty, 2, "qty conservado tras guardar");
  assert.equal(despues.items[0].precio, 250);
  assert.deepEqual(errores, []);
});
