// tests/secciones.test.mjs — secciones personalizables del inventario (decisión B):
// reglas puras de agrupación/validación y acciones del store (crear, renombrar,
// borrar sin perder productos, mover un artículo).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as store from "../src/estado/store.js";
import { datosDemo } from "../src/datos/demo.js";
import {
  agruparPorSeccion, validarNombreSeccion, contarEnSeccion, seccionDeProducto,
  SECCION_NOMBRE_MAX,
} from "../src/nucleo/secciones.js";

const U = { id: "u1", nombre: "Dueña" };

function storeTest() {
  const mem = { escrituras: [] };
  store.configurar({
    disponible: () => true,
    cargar: () => ({
      orders: [], inventory: [], clients: [], events: [], log: [], secciones: [],
      users: [], usuarioId: "u1", prefijo: "+598", theme: "dark",
    }),
    guardar: (d) => { mem.escrituras.push(d); return { ok: true, degradado: false }; },
  });
  store.boot();
  return mem;
}

/* ── reglas puras ── */

test("agrupar por sección: orden de las secciones y 'Sin sección' al final", () => {
  const secs = [{ id: "a", nombre: "Dama" }, { id: "b", nombre: "Hombre" }];
  const inv = [
    { id: "1", name: "Vestido", seccionId: "b" },
    { id: "2", name: "Camisa", seccionId: "a" },
    { id: "3", name: "Corbata", seccionId: null },
    { id: "4", name: "Medias", seccionId: "borrada" },
  ];
  const g = agruparPorSeccion(inv, secs);
  assert.deepEqual(g.map((x) => x.nombre), ["Dama", "Hombre", "Sin sección"]);
  assert.deepEqual(g[0].productos.map((p) => p.id), ["2"]);
  assert.deepEqual(g[1].productos.map((p) => p.id), ["1"]);
  assert.deepEqual(g[2].productos.map((p) => p.id), ["3", "4"], "una sección borrada cae en Sin sección");
});

test("agrupar por sección: la búsqueda filtra dentro de cada cajón y oculta los vacíos", () => {
  const secs = [{ id: "a", nombre: "Dama" }, { id: "b", nombre: "Hombre" }];
  const inv = [
    { id: "1", name: "Vestido floral", seccionId: "a" },
    { id: "2", name: "Short crudo", seccionId: "a" },
    { id: "3", name: "Camisa", seccionId: "b" },
  ];
  const g = agruparPorSeccion(inv, secs, { buscar: "sho" });
  assert.deepEqual(g.map((x) => x.nombre), ["Dama"], "solo queda el cajón con coincidencias");
  assert.deepEqual(g[0].productos.map((p) => p.id), ["2"]);
  assert.equal(agruparPorSeccion(inv, secs, { buscar: "zzz" }).length, 0);
});

test("agrupar por sección: la búsqueda ignora tildes y mayúsculas", () => {
  const secs = [{ id: "a", nombre: "Dama" }];
  const inv = [{ id: "1", name: "Pantalón negro", seccionId: "a" }];
  for (const q of ["pantalon", "PANTALÓN", "  Pantalón  "]) {
    const g = agruparPorSeccion(inv, secs, { buscar: q });
    assert.deepEqual(g.map((x) => x.productos.map((p) => p.id)), [["1"]], q);
  }
});

test("validar nombre: vacío, duplicado (sin distinguir mayúsculas ni tildes) y largo máximo", () => {
  const secs = [{ id: "a", nombre: "Dama · verano" }];
  assert.equal(validarNombreSeccion("   ", secs).ok, false);
  assert.equal(validarNombreSeccion("dama · VERANO", secs).error, "Ya tenés una sección con ese nombre");
  assert.equal(validarNombreSeccion("Básicos de hombre", secs).ok, true);
  assert.equal(validarNombreSeccion("BASICOS DE HOMBRE", [{ id: "b", nombre: "Básicos de hombre" }]).ok, false);
  assert.equal(validarNombreSeccion("x".repeat(SECCION_NOMBRE_MAX + 1), secs).ok, false);
  /* el mismo nombre sobre sí misma (renombrar) no choca */
  assert.equal(validarNombreSeccion("Dama · verano", secs, { exceptoId: "a" }).ok, true);
  assert.equal(validarNombreSeccion("  Básicos   de   hombre ", secs).nombre, "Básicos de hombre");
});

test("seccionDeProducto: si la sección ya no existe, el producto cuenta como suelto", () => {
  const secs = [{ id: "a", nombre: "Dama" }];
  assert.equal(seccionDeProducto({ seccionId: "a" }, secs), "a");
  assert.equal(seccionDeProducto({ seccionId: "x" }, secs), null);
  assert.equal(seccionDeProducto({}, secs), null);
  assert.equal(contarEnSeccion([{ seccionId: "a" }, { seccionId: "a" }, {}], "a"), 2);
});

/* ── acciones del store ── */

test("crear sección: guarda, la lista la ve y queda en el historial", () => {
  storeTest();
  store.boot(structuredClone(datosDemo()));
  const r = store.crearSeccion("  Interior   femenino ", U);
  assert.equal(r.ok, true);
  assert.equal(r.seccion.nombre, "Interior femenino");
  assert.equal(store.secciones().length, 3);
  const log = store.log();
  assert.equal(log[log.length - 1].action, "sec_new");
  assert.equal(log[log.length - 1].detail, "Interior femenino");
});

test("crear sección: nombre repetido o vacío no crea nada", () => {
  storeTest();
  store.boot(structuredClone(datosDemo()));
  const antes = store.secciones().length;
  assert.equal(store.crearSeccion("dama · VERANO", U).ok, false);
  assert.equal(store.crearSeccion("", U).ok, false);
  assert.equal(store.secciones().length, antes);
});

test("renombrar sección: cambia el nombre y no mueve productos", () => {
  storeTest();
  store.boot(structuredClone(datosDemo()));
  const r = store.renombrarSeccion("ds1", "Dama · invierno", U);
  assert.equal(r.ok, true);
  assert.equal(store.seccionPorId("ds1").nombre, "Dama · invierno");
  assert.equal(store.productoPorId("di1").seccionId, "ds1");
  assert.equal(store.renombrarSeccion("nope", "X", U).ok, false);
});

test("borrar sección: los productos pasan a 'Sin sección' y NO se borran", () => {
  storeTest();
  store.boot(structuredClone(datosDemo()));
  const inventarioAntes = store.db().inventory.length;
  const enDs1 = store.db().inventory.filter((p) => p.seccionId === "ds1").length;
  assert.equal(enDs1, 2);
  const r = store.eliminarSeccion("ds1", U);
  assert.equal(r.ok, true);
  assert.equal(r.movidos, enDs1);
  assert.equal(store.seccionPorId("ds1"), null);
  assert.equal(store.db().inventory.length, inventarioAntes, "no se pierde ningún producto");
  assert.equal(store.db().inventory.filter((p) => p.seccionId === "ds1").length, 0);
  assert.equal(store.productoPorId("di1").seccionId, null);
  const log = store.log();
  assert.equal(log[log.length - 1].action, "sec_del");
  assert.match(log[log.length - 1].detail, /a Sin sección/);
});

test("mover producto a una sección y de vuelta a 'Sin sección'", () => {
  storeTest();
  store.boot(structuredClone(datosDemo()));
  const r = store.moverProductoASeccion("di5", "ds1", U);
  assert.equal(r.ok, true);
  assert.equal(store.productoPorId("di5").seccionId, "ds1");
  assert.equal(store.log().at(-1).action, "inv_move");
  assert.match(store.log().at(-1).detail, /Dama · verano/);
  const v = store.moverProductoASeccion("di5", null, U);
  assert.equal(v.ok, true);
  assert.equal(store.productoPorId("di5").seccionId, null);
  assert.match(store.log().at(-1).detail, /Sin sección/);
});

test("mover producto: una sección que no existe no se acepta", () => {
  storeTest();
  store.boot(structuredClone(datosDemo()));
  const r = store.moverProductoASeccion("di5", "inventada", U);
  assert.equal(r.ok, false);
  assert.equal(store.productoPorId("di5").seccionId, null);
});

test("producto nuevo y edición respetan la sección elegida", () => {
  storeTest();
  store.boot(structuredClone(datosDemo()));
  const alta = store.crearProducto({ name: "Top de lino", price: "980", cat: "top", seccionId: "ds1" }, U);
  assert.equal(alta.ok, true);
  assert.equal(alta.producto.seccionId, "ds1");
  const edit = store.editarProducto(alta.producto.id, { name: "Top de lino", price: "980", cat: "top", seccionId: "ds2" }, U);
  assert.equal(edit.producto.seccionId, "ds2");
  /* sección inexistente en el alta: cae a "Sin sección" en vez de fallar */
  const raro = store.crearProducto({ name: "Bufanda", price: "300", cat: "otro", seccionId: "zzz" }, U);
  assert.equal(raro.producto.seccionId, null);
  /* sin seccionId en la edición: conserva la que tenía */
  const conserva = store.editarProducto(alta.producto.id, { name: "Top de lino", price: "1000", cat: "top" }, U);
  assert.equal(conserva.producto.seccionId, "ds2");
});

test("respaldo: exportar e importar conserva las secciones y suelta las huérfanas", () => {
  storeTest();
  store.boot(structuredClone(datosDemo()));
  const json = store.exportar();
  const conSecciones = store.importar(json);
  assert.equal(conSecciones.ok, true);
  assert.equal(store.secciones().length, 2);
  assert.equal(store.productoPorId("di1").seccionId, "ds1");

  /* respaldo con un producto apuntando a una sección que no viene: queda suelto */
  const datos = JSON.parse(json);
  datos.inventory[0].seccionId = "fantasma";
  datos.secciones = [];
  store.importar(JSON.stringify(datos));
  assert.equal(store.productoPorId("di1").seccionId, null);
});
