// tests/hallazgos-arquitectura.test.mjs — regresión de los hallazgos 4–8 de la
// revisión de arquitectura (v35): un solo barrel, un solo FILTROS, un solo
// formato de plata, un solo flujo de foto y aviso visible cuando el dispositivo
// no guarda. Cada test falla si la duplicación vuelve o si el aviso desaparece.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const RAIZ = process.cwd();
const leer = (rel) => fs.readFileSync(path.join(RAIZ, rel), "utf8");
const existe = (rel) => fs.existsSync(path.join(RAIZ, rel));

/* archivos de la app (sin tests ni el service worker) */
function archivosSrc(dir = "src", out = []) {
  for (const e of fs.readdirSync(path.join(RAIZ, dir), { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) archivosSrc(rel, out);
    else if (e.isFile() && e.name.endsWith(".js")) out.push(rel);
  }
  return out;
}

/* ── 6 · doble barrel ── */
test("6: un solo barrel del núcleo (nucleo/index.js), sin nucleo.js duplicado", () => {
  assert.ok(existe("src/nucleo/index.js"), "existe el barrel único");
  assert.ok(!existe("src/nucleo/nucleo.js"), "el barrel duplicado ya no existe");
  for (const rel of archivosSrc()) {
    const src = leer(rel);
    assert.doesNotMatch(src, /from "(\.\.\/)+nucleo\/nucleo\.js"/, `${rel} no importa el barrel borrado`);
  }
  assert.doesNotMatch(leer("sw.js"), /nucleo\/nucleo\.js/, "el precache no pide el archivo borrado");
});

test("6: el barrel único reexporta todo lo que las pantallas importan del núcleo", async () => {
  const nucleo = await import(new URL("../src/nucleo/index.js", import.meta.url).href);
  for (const nombre of ["fmt", "fmtMonto", "parseMoneda", "total", "FILTROS", "ESTADOS", "tonoDe", "uid", "fdateShort", "dstr"]) {
    assert.ok(nombre in nucleo, `nucleo/index.js exporta ${nombre}`);
  }
});

/* ── 7 · FILTROS duplicado ── */
test("7: FILTROS existe una sola vez y su etiqueta/tono sale de ESTADOS", async () => {
  const conDefinicion = archivosSrc().filter((rel) => /export const FILTROS\s*=/.test(leer(rel)));
  assert.deepEqual(conDefinicion, [path.join("src", "nucleo", "filtros.js")], "una sola definición de FILTROS");
  const { FILTROS, ESTADOS } = await import(new URL("../src/nucleo/index.js", import.meta.url).href);
  assert.equal(FILTROS[0].id, "all");
  for (const f of FILTROS.slice(1)) {
    assert.equal(f.label, ESTADOS[f.id].l, `la etiqueta de ${f.id} sale de ESTADOS`);
    assert.equal(f.tono, ESTADOS[f.id].c, `el tono de ${f.id} sale de ESTADOS`);
  }
});

test("7: no quedan mapas de tonos ni de etiquetas de estado en paralelo", async () => {
  for (const rel of archivosSrc()) {
    const src = leer(rel);
    assert.doesNotMatch(src, /const TONOS\s*=/, `${rel} no repite el mapa de tonos`);
    assert.doesNotMatch(src, /new: "Nuevo",\s*msg: "Mensaje enviado"/, `${rel} no repite las etiquetas de estado`);
  }
  const { tonoDe, ESTADOS } = await import(new URL("../src/nucleo/index.js", import.meta.url).href);
  assert.equal(tonoDe({ estado: "paid" }), ESTADOS.paid.c);
});

/* ── 5 · moneda duplicada ── */
test("5: el formato de plata vive en nucleo/moneda.js (nadie más formatea a mano)", () => {
  for (const rel of archivosSrc()) {
    const src = leer(rel);
    if (rel === path.join("src", "nucleo", "moneda.js")) continue;
    assert.doesNotMatch(src, /toLocaleString\(\s*"es-MX"/, `${rel} no formatea plata por su cuenta`);
    assert.doesNotMatch(src, /"\$" \+/, `${rel} no pega el signo a mano`);
  }
});

test("5: fmt es el mismo texto para el contador animado y para el valor final", async () => {
  const { fmt } = await import(new URL("../src/nucleo/moneda.js", import.meta.url).href);
  const plantilla = leer("src/ui/plantilla.js");
  assert.match(plantilla, /el\.textContent = formato === "n" \? String\(Math\.round\(v\)\) : fmt\(v\)/, "el contador usa fmt()");
  assert.equal(fmt(1250), "$1,250");
  assert.equal(fmt(1234.5), "$1,234.50");
});

/* ── 8 · foto-picker duplicado ── */
test("8: elegir foto tiene una sola implementación, compartida por los dos editores", () => {
  assert.ok(existe("src/ui/componentes/foto-picker.js"), "existe el módulo compartido");
  assert.match(leer("src/ui/componentes/foto-picker.js"), /export function conectarFotoPicker/, "expone conectarFotoPicker");
  for (const rel of ["src/pantallas/pantalla-inventario-editor.js", "src/pantallas/pantalla-pedido-editor.js"]) {
    const src = leer(rel);
    assert.match(src, /conectarFotoPicker/, `${rel} usa el flujo compartido`);
    assert.doesNotMatch(src, /comprimirFoto/, `${rel} ya no comprime por su cuenta`);
    assert.doesNotMatch(src, /onchange\s*=\s*(e|tomar)\s*=>.*files\[0\]/, `${rel} ya no arma su propio onchange`);
  }
  const pickers = archivosSrc().filter((rel) => /comprimirFoto\(/.test(leer(rel)));
  assert.deepEqual(pickers.sort(), [path.join("src", "servicios", "fotos.js"), path.join("src", "ui", "componentes", "foto-picker.js")].sort(),
    "solo el servicio de fotos y el picker comprimen imágenes");
});

/* ── 4 · persistencia degradada invisible ── */
test("4: si el disco rechaza la escritura, el store avisa y no deja el cambio a medias", async () => {
  const store = await import(new URL("../src/estado/store.js", import.meta.url).href);
  const avisos = [];
  const soltar = store.suscribirDisco((r) => avisos.push(r));
  store.configurar({
    disponible: () => true,
    cargar: () => ({ orders: [], inventory: [], clients: [], events: [], log: [], secciones: [], users: [], usuarioId: "u1", prefijo: "+598", theme: "dark" }),
    guardar: () => ({ ok: false, degradado: true }),
  });
  store.boot();
  const r = store.crearCliente({ name: "Clienta de prueba" });
  soltar();
  assert.equal(r.persistencia.ok, false, "la acción informa que no se guardó");
  assert.equal(store.clientes().length, 0, "el estado en memoria no queda con el cambio perdido");
  assert.ok(avisos.some((a) => a.ok === false), "el canal de aviso recibió el fallo");
});

test("4: guardar sin fotos (degradado) se avisa aparte, y un guardado normal no avisa", async () => {
  const { avisoGuardado, avisoSoloMemoria } = await import(new URL("../src/nucleo/avisos-disco.js", import.meta.url).href);
  assert.equal(avisoGuardado({ ok: true, degradado: false }), null, "guardado normal: sin aviso");
  assert.equal(avisoGuardado({ ok: true, degradado: true }).tipo, "aviso", "sin fotos: aviso ámbar");
  const error = avisoGuardado({ ok: false, degradado: true });
  assert.equal(error.tipo, "error", "rechazado: aviso rojo");
  assert.match(error.texto, /no se guardó nada/i);
  assert.match(avisoSoloMemoria().texto, /se pierde al cerrarla/i);
});

test("4: la franja de aviso existe en el HTML, arranca oculta y main.js la pinta", () => {
  const html = leer("index.html");
  assert.match(html, /id="aviso-disco"[^>]*role="status"[^>]*aria-live="polite"[^>]*hidden/, "la franja arranca oculta y anunciada");
  for (const id of ["aviso-disco-ico", "aviso-disco-titulo", "aviso-disco-texto", "aviso-disco-x"]) {
    assert.ok(html.includes(`id="${id}"`), `el HTML tiene ${id}`);
  }
  const main = leer("src/main.js");
  assert.match(main, /suscribirDisco\(/, "main.js escucha el resultado de persistencia");
  assert.match(main, /mostrarAvisoDisco\(avisoGuardado\(r\)\)|avisoGuardado\(r\)/, "main.js traduce el resultado a aviso");
  assert.match(main, /enSoloMemoria\(\)/, "main.js avisa si arrancó sin poder guardar");
  const css = leer("src/ui/componentes/capas.css");
  assert.match(css, /\.aviso-disco\{/, "el aviso tiene estilos propios");
  assert.match(css, /\.aviso-disco\[hidden\]\{display:none\}/, "oculto no ocupa lugar");
});
