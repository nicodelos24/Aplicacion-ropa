// tests/pedido-picker.test.mjs — selector del pedido en filas compactas por
// sección (decisión Y): agrupamiento, orden estable, búsqueda que nunca
// deselecciona y badge elegidos/total. Reglas puras, sin DOM.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ordenarParaElegir, gruposParaElegir, hayResultados, contarElegidos,
} from "../src/nucleo/pedido-picker.js";

const SECS = [{ id: "a", nombre: "Dama · verano" }, { id: "b", nombre: "Hombre · básicos" }];
const INV = [
  { id: "1", name: "Vestido floral", seccionId: "a" },
  { id: "2", name: "Top de lino", seccionId: "a" },
  { id: "3", name: "Camisa blanca", seccionId: "b" },
  { id: "4", name: "Short crudo", seccionId: "a" },
  { id: "5", name: "Medias lanas", seccionId: null },
  { id: "6", name: "Corbata", seccionId: "borrada" },
];

const ids = (g) => g.productos.map((p) => p.id);

test("grupos: una entrada por sección en su orden, 'Sin sección' al final", () => {
  const g = gruposParaElegir(INV, SECS);
  assert.deepEqual(g.map((x) => x.nombre), ["Dama · verano", "Hombre · básicos", "Sin sección"]);
  assert.deepEqual(ids(g[0]), ["1", "2", "4"]);
  assert.deepEqual(ids(g[1]), ["3"]);
  assert.deepEqual(ids(g[2]), ["5", "6"], "una sección borrada cae en Sin sección");
});

test("grupos: sin búsqueda se ven todas las secciones, aunque estén vacías", () => {
  const secs = [...SECS, { id: "c", nombre: "Interior femenino" }];
  const g = gruposParaElegir(INV, secs);
  assert.equal(g.length, 4);
  const vacia = g.find((x) => x.id === "c");
  assert.deepEqual(ids(vacia), []);
  assert.equal(vacia.total, 0);
});

test("grupos: badges elegidos/total por sección", () => {
  const g = gruposParaElegir(INV, SECS, { elegidos: new Set(["1", "3"]) });
  const dama = g.find((x) => x.id === "a");
  const hombre = g.find((x) => x.id === "b");
  const sueltos = g.find((x) => x.id === null);
  assert.deepEqual([dama.elegidos, dama.total], [1, 3]);
  assert.deepEqual([hombre.elegidos, hombre.total], [1, 1]);
  assert.deepEqual([sueltos.elegidos, sueltos.total], [0, 2]);
  assert.equal(hombre.hayElegidos, true);
  assert.equal(sueltos.hayElegidos, false);
});

test("orden dentro de la sección: más usados primero y después el orden de alta", () => {
  const usos = new Map([["4", 3], ["1", 1]]);
  const lista = ordenarParaElegir(INV.filter((p) => p.seccionId === "a"), { usos });
  assert.deepEqual(lista.map((p) => p.id), ["4", "1", "2"]);
});

test("orden estable: marcar un producto no reordena la lista ni mueve las secciones", () => {
  const antes = gruposParaElegir(INV, SECS).map((g) => [g.nombre, ids(g)]);
  const despues = gruposParaElegir(INV, SECS, { elegidos: new Set(["4", "5"]) }).map((g) => [g.nombre, ids(g)]);
  assert.deepEqual(despues, antes, "nada salta debajo del dedo: el badge marca lo elegido");
});

test("ordenarParaElegir y gruposParaElegir no tocan las listas originales", () => {
  const inv = INV.map((p) => ({ ...p }));
  const secs = SECS.map((s) => ({ ...s }));
  gruposParaElegir(inv, secs, { elegidos: new Set(["4"]), buscar: "o" });
  assert.deepEqual(inv.map((p) => p.id), INV.map((p) => p.id));
  assert.deepEqual(secs, SECS);
});

test("búsqueda: filtra por nombre dentro de cada sección y oculta los vacíos", () => {
  const g = gruposParaElegir(INV, SECS, { buscar: "sho" });
  assert.deepEqual(g.map((x) => x.nombre), ["Dama · verano"]);
  assert.deepEqual(ids(g[0]), ["4"]);
  assert.equal(gruposParaElegir(INV, SECS, { buscar: "zzz" }).length, 0);
  assert.equal(hayResultados(gruposParaElegir(INV, SECS, { buscar: "zzz" })), false);
});

test("búsqueda: no deselecciona — lo elegido que no coincide sigue a la vista", () => {
  const g = gruposParaElegir(INV, SECS, { buscar: "sho", elegidos: new Set(["3"]) });
  const hombre = g.find((x) => x.id === "b");
  assert.ok(hombre, "la sección con un elegido no desaparece al buscar");
  assert.deepEqual(ids(hombre), ["3"], "el elegido se mantiene con su check");
  assert.equal(hombre.elegidos, 1);
  assert.equal(hombre.total, 1);
  assert.equal(hombre.coincide, 0, "no coincide con la búsqueda: solo se mantiene por estar elegido");
});

test("búsqueda: si nada coincide, hayResultados es false aunque haya elegidos a la vista", () => {
  const g = gruposParaElegir(INV, SECS, { buscar: "zzz", elegidos: new Set(["3"]) });
  assert.deepEqual(g.map((x) => x.nombre), ["Hombre · básicos"], "el elegido sigue visible");
  assert.equal(hayResultados(g), false, "el vacío igual le dice que no hay coincidencias");
  assert.equal(hayResultados(gruposParaElegir(INV, SECS, { buscar: "sho", elegidos: new Set(["3"]) })), true);
  assert.equal(hayResultados(gruposParaElegir(INV, SECS)), true, "sin búsqueda siempre hay algo");
});

test("búsqueda sin tildes: «pantalon» encuentra «Pantalón»", () => {
  const inv = [{ id: "1", name: "Pantalón negro", seccionId: null }];
  const g = gruposParaElegir(inv, [], { buscar: "pantalon" });
  assert.deepEqual(ids(g[0]), ["1"]);
});

test("contarElegidos y aceptar lista además de Set", () => {
  assert.equal(contarElegidos(new Set(["1", "2"])), 2);
  assert.equal(contarElegidos(["1"]), 1);
  assert.equal(contarElegidos(), 0);
  const g = gruposParaElegir(INV, SECS, { elegidos: ["1"] });
  assert.equal(g.find((x) => x.id === "a").elegidos, 1);
});
