// tests/vivo-hash.test.mjs — abrir y recargar la app en la sección que dice la URL.
// Antes el hash se ignoraba al arrancar (siempre Inicio): recargar el inventario
// en el vivo perdía la sección, y un enlace a `#inventario` abría Inicio.
// Acá se fija la parte pura (seccionDelHash) y el cableado en main.js/índice.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const leer = (rel) => fs.readFileSync(path.join(RAIZ, rel), "utf8");
const { SECCIONES, seccionDelHash, vista } = await import(path.join(RAIZ, "src/estado/vista.js"));

test("seccionDelHash: solo las secciones de la app, con o sin almohadilla", () => {
  assert.deepEqual(SECCIONES, ["inicio", "agenda", "pedidos", "inventario", "contactos", "historial", "ajustes"]);
  assert.equal(seccionDelHash("#inventario"), "inventario");
  assert.equal(seccionDelHash("#agenda"), "agenda");
  assert.equal(seccionDelHash("inventario"), "inventario");
  assert.equal(seccionDelHash("  #pedidos  "), "pedidos");
});

test("seccionDelHash: vacío o desconocido no manda a ninguna parte", () => {
  for (const h of ["", "#", null, undefined, "#inventarioo", "#pedido", "#../ajustes", "#INVENTARIO"]) {
    assert.equal(seccionDelHash(h), null, `hash inválido: ${String(h)}`);
  }
});

test("seccionDelHash: la vista por defecto sigue siendo inicio y no se toca", () => {
  assert.equal(vista.seccion, "inicio", "el módulo no cambia la vista al importarse");
});

test("main.js abre la sección del hash al arrancar y escucha los cambios de hash", () => {
  const main = leer("src/main.js");
  assert.match(main, /const seccionURL = seccionDelHash\(location\.hash\)/, "lee la sección de la URL al arrancar");
  assert.match(main, /addEventListener\("hashchange"/, "un enlace a #seccion abre esa sección");
  assert.match(main, /history\.replaceState\(\{ seccion: vista\.seccion \}/, "la entrada raíz guarda la sección de entrada");
});

test("el índice declara las mismas secciones que la lista (sin duplicar la verdad)", () => {
  const html = leer("index.html");
  const enNav = [...html.matchAll(/data-v="([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(enNav)], SECCIONES, "cada botón de la barra es una sección conocida");
});
