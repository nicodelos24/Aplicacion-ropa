// tests/orden.test.mjs — filtro por categoría y orden del inventario (decisión 1):
// reglas puras de orden.js, sin DOM.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ORDENES, ORDEN_DEFECTO, esOrden, etiquetaOrden, categoriaValida, usosPorProducto,
  filtrarInventario, ordenarInventario, categoriasConConteo, hayFiltro,
} from "../src/nucleo/orden.js";

const inv = () => [
  { id: "a", name: "Vestido floral", price: 1200, cat: "vestido" },
  { id: "b", name: "Camisa blanca", price: 950, cat: "camisa" },
  { id: "c", name: "Pantalón negro", price: 1400, cat: "pantalon" },
  { id: "d", name: "Abrigo largo", price: 3200, cat: "abrigo" },
  { id: "e", name: "Medias lanas", price: 250, cat: "media" },
  { id: "f", name: "vestido negro", price: 900, cat: "vestido" },
];

test("orden: el catálogo de órdenes arranca en el de siempre y «Más usados» está", () => {
  assert.equal(ORDEN_DEFECTO, "alta");
  assert.equal(ORDENES[0].id, "alta");
  assert.ok(ORDENES.some((o) => o.id === "usados"));
  assert.equal(etiquetaOrden("precio-desc"), "Precio: mayor a menor");
  assert.equal(etiquetaOrden("cualquiera"), "Los últimos", "un orden desconocido cae en el de siempre");
  assert.equal(esOrden("az"), true);
  assert.equal(esOrden("zzz"), false);
});

test("filtro: por categoría deja solo esa y no toca el inventario original", () => {
  const lista = inv();
  const vestidos = filtrarInventario(lista, "vestido");
  assert.deepEqual(vestidos.map((p) => p.id), ["a", "f"]);
  assert.equal(lista.length, 6, "no muta la entrada");
  assert.equal(filtrarInventario(lista, "todas").length, 6);
  assert.equal(filtrarInventario(lista, "no-existe").length, 6, "una categoría rara es «todas»");
  assert.deepEqual(filtrarInventario([{ id: "x", name: "sin cat", price: 1 }], "otro").map((p) => p.id), ["x"],
    "un producto sin categoría cuenta como accesorio/otro");
});

test("orden: A–Z ignora acentos y mayúsculas", () => {
  assert.deepEqual(ordenarInventario(inv(), "az").map((p) => p.id), ["d", "b", "e", "c", "a", "f"],
    "abrigo, camisa, medias, pantalón, vestido floral, vestido negro");
  const conMayus = [{ id: "1", name: "Zapato" }, { id: "2", name: "árbol" }, { id: "3", name: "Bufanda" }];
  assert.deepEqual(ordenarInventario(conMayus, "az").map((p) => p.id), ["2", "3", "1"],
    "«árbol» va antes que «Bufanda», sin importar la tilde ni la mayúscula");
});

test("orden: precio menor/mayor a menor con desempate por nombre", () => {
  assert.deepEqual(ordenarInventario(inv(), "precio-asc").map((p) => p.price), [250, 900, 950, 1200, 1400, 3200]);
  assert.deepEqual(ordenarInventario(inv(), "precio-desc").map((p) => p.price), [3200, 1400, 1200, 950, 900, 250]);
  const empatados = [{ id: "1", name: "Zeta", price: 100 }, { id: "2", name: "alfa", price: 100 }];
  assert.deepEqual(ordenarInventario(empatados, "precio-asc").map((p) => p.id), ["2", "1"]);
});

test("orden: «más usados» cuenta unidades de los pedidos y desempata por nombre", () => {
  const pedidos = [
    { items: [{ productoId: "e", qty: 3 }, { productoId: "b", qty: 1 }] },
    { items: [{ productoId: "e", qty: 2 }, { productoId: null, qty: 9 }] },
    { items: [] },
  ];
  const usos = usosPorProducto(pedidos);
  assert.equal(usos.get("e"), 5, "suma las unidades de todos los pedidos");
  assert.equal(usos.get("b"), 1);
  assert.equal(usos.has(null), false, "un producto escrito a mano no suma");
  const ids = ordenarInventario(inv(), "usados", { usos }).map((p) => p.id);
  assert.deepEqual(ids, ["e", "b", "d", "c", "a", "f"],
    "más usados primero y el resto A–Z (abrigo, pantalón, vestido floral, vestido negro)");
});

test("orden: «los últimos» conserva el orden de entrada", () => {
  const lista = inv();
  assert.deepEqual(ordenarInventario(lista, "alta").map((p) => p.id), lista.map((p) => p.id));
  assert.deepEqual(ordenarInventario(lista, "desconocido").map((p) => p.id), lista.map((p) => p.id));
});

test("filtro: categorías con conteo solo de las que tienen prendas, en orden del catálogo", () => {
  const cats = categoriasConConteo(inv());
  assert.deepEqual(cats.map((c) => c.id), ["vestido", "pantalon", "camisa", "abrigo", "media"]);
  assert.equal(cats.find((c) => c.id === "vestido").n, 2);
  assert.equal(categoriasConConteo([]).length, 0);
});

test("filtro: categoría y orden se normalizan contra el estado de la vista", () => {
  assert.equal(categoriaValida("vestido"), "vestido");
  assert.equal(categoriaValida(undefined), "todas");
  assert.equal(hayFiltro(), false, "sin filtros no hay nada que limpiar");
  assert.equal(hayFiltro({ categoria: "media" }), true);
  assert.equal(hayFiltro({ orden: "az" }), true);
});
