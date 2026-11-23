// tests/regresion-atomicidad.test.mjs — regresión de la revisión de arquitectura
// del 23-nov (hallazgos 1–3): un solo motor de total, alta atómica sin productos
// huérfanos y edición que no revive un pedido pagado.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as store from "../src/estado/store.js";
import { datosDemo } from "../src/datos/demo.js";
import { total, subtotalItem, totalItems, aplicarDatosPedido } from "../src/nucleo/pedidos.js";
import { resumenGeneral } from "../src/nucleo/filtros.js";
import { pedidos, productos } from "../src/estado/store.js";

const U = { id: "u1", nombre: "Dueña" };

/** Store en memoria con persistencia bajo control del test. */
function storeTest(guardar) {
  const mem = { escrituras: [] };
  store.configurar({
    disponible: () => true,
    cargar: () => datosDemo(),
    guardar: guardar || ((d) => { mem.escrituras.push(d); return { ok: true, degradado: false }; }),
  });
  store.boot();
  return mem;
}

/* ---- hallazgo 1: un solo motor de total ---- */

test("un solo motor de total: resumenGeneral coincide con total() pedido por pedido", () => {
  const lista = [
    /* los casos que antes divergían: qty negativa, precio no numérico, qty 0 y strings */
    { estado: "paid", items: [{ precio: 100, qty: -3 }, { precio: "abc", qty: 2 }] },
    { estado: "new", items: [{ precio: 250, qty: 2 }, { precio: 0, qty: 0 }] },
    { estado: "due", items: [{ name: "Medias", price: 300, qty: "2" }] },
  ];
  const r = resumenGeneral(lista);
  const pagados = lista.filter((p) => p.estado === "paid").reduce((s, p) => s + total(p), 0);
  const pendientes = lista.filter((p) => p.estado !== "paid").reduce((s, p) => s + total(p), 0);
  assert.equal(r.cobrado, pagados, "cobrado es la misma suma que total()");
  assert.equal(r.pendiente, pendientes, "pendiente es la misma suma que total()");
  assert.equal(r.cobrado, 100);
  assert.equal(r.pendiente, 1100);
});

test("totalItems: el subtotal del carrito usa la misma regla que la tarjeta", () => {
  const items = [{ precio: 100, qty: -3 }, { precio: 400, qty: 2 }];
  assert.equal(totalItems(items), subtotalItem(items[0]) + subtotalItem(items[1]));
  assert.equal(total({ items }), totalItems(items), "misma regla para el pedido y para ítems sueltos");
  assert.equal(totalItems([]), 0);
  assert.equal(totalItems(null), 0);
});

test("motor único en el store: Inicio (resumenGeneral) suma igual que las tarjetas", () => {
  storeTest();
  const todos = pedidos();
  const r = resumenGeneral(todos);
  const cobrado = todos.filter((p) => p.estado === "paid").reduce((s, p) => s + total(p), 0);
  const pendiente = todos.filter((p) => p.estado !== "paid").reduce((s, p) => s + total(p), 0);
  assert.equal(r.cobrado, cobrado);
  assert.equal(r.pendiente, pendiente);
});

/* ---- hallazgo 2: crearPedido atómico ---- */

test("crear pedido sin productos no deja productos huérfanos en el inventario", () => {
  storeTest();
  const antes = productos().map((p) => p.id);
  const r = store.crearPedido({ cliente: "Alguien", items: [] }, U);
  assert.equal(r.ok, false, "sin ítems el alta falla");
  assert.deepEqual(productos().map((p) => p.id), antes, "ningún producto quedó suelto en el inventario");
  assert.equal(store.pedidos().length, 5, "tampoco se creó el pedido");
});

test("crear pedido atómico: si el disco falla no queda ni el pedido ni sus productos", () => {
  storeTest(() => ({ ok: false, degradado: true }));
  const productosAntes = productos().length;
  const pedidosAntes = store.pedidos().length;
  const r = store.crearPedido({
    cliente: "Rosita",
    items: [{ productoId: "di1", qty: 1 }, { nombre: "Bufanda nueva", precio: 340, qty: 1 }],
  }, U);
  assert.equal(r.ok, false, "el alta avisa que no se guardó");
  assert.equal(r.persistencia.ok, false);
  assert.equal(store.pedidos().length, pedidosAntes, "no hay pedido en memoria sin disco");
  assert.equal(productos().length, productosAntes, "ni producto huérfano");
});

test("crear pedido: dos ítems a mano del mismo nombre crean un solo producto", () => {
  storeTest();
  const antes = productos().length;
  const r = store.crearPedido({
    cliente: "Rosita",
    items: [{ nombre: "Pañuelo", precio: 100, qty: 1 }, { nombre: "pañuelo", precio: 100, qty: 2 }],
  }, U);
  assert.ok(r.ok);
  assert.equal(r.nuevosProductos, 1, "un solo producto nuevo");
  assert.equal(productos().length, antes + 1);
  assert.equal(total(store.pedidoPorId(r.pedido.id)), 300);
});

/* ---- hallazgo 3: editarPedido no revive un pagado ---- */

test("aplicarDatosPedido: un pagado no vuelve atrás al editar y conserva sus cuotas", () => {
  const pagado = { estado: "paid", cuotas: 3, cuotasPagadas: 3 };
  const r = aplicarDatosPedido(pagado, { estado: "new", cuotas: 2, cuotasPagadas: 0 });
  assert.equal(r.estado, "paid");
  assert.equal(r.cuotasPagadas, 3, "no se des-sellan las cuotas del pago");
  /* el alta no tiene original: manda el estado que llega */
  assert.equal(aplicarDatosPedido(null, { estado: "new" }).estado, "new");
  assert.equal(aplicarDatosPedido(null, { estado: "due", cuotas: 3 }).estado, "due");
});

test("aplicarDatosPedido: cuotas completas al guardar pasan el pedido a pagado", () => {
  const enCuotas = { estado: "due", cuotas: 3, cuotasPagadas: 1 };
  assert.equal(aplicarDatosPedido(enCuotas, { estado: "due", cuotas: 3, cuotasPagadas: 3 }).estado, "paid");
  const sigue = aplicarDatosPedido(enCuotas, { estado: "due", cuotas: 3, cuotasPagadas: 2 });
  assert.equal(sigue.estado, "due");
  assert.equal(sigue.cuotasPagadas, 2);
  /* sin las cuotas pagadas en el payload se conservan las del original */
  assert.equal(aplicarDatosPedido(enCuotas, { estado: "due" }).cuotasPagadas, 1);
  assert.equal(aplicarDatosPedido(enCuotas, { estado: "due", cuotas: 2, cuotasPagadas: 2 }).cuotasPagadas, 2);
  /* salir de "En cuotas" descarta las cuotas */
  assert.equal(aplicarDatosPedido(enCuotas, { estado: "msg" }).cuotasPagadas, 0);
});

test("editar pedido no revive un pagado: conserva estado, cuotas y aplica los productos", () => {
  storeTest();
  const pagado = store.pedidoPorId("d4");
  assert.equal(pagado.estado, "paid");
  const r = store.editarPedido("d4", {
    cliente: "Rosita", estado: "new", cuotas: 2, cuotasPagadas: 0,
    items: pagado.items.map((i) => ({ ...i })),
  }, U);
  assert.ok(r.ok);
  const despues = store.pedidoPorId("d4");
  assert.equal(despues.estado, "paid", "guardar una edición no deshace el pago");
  assert.equal(despues.cuotasPagadas, 2, "conserva las cuotas pagadas del original");
  assert.equal(despues.items[0].qty, 2, "pero sí aplica los cambios de productos");
  assert.equal(total(despues), 500, "y el total sigue siendo el del pedido");
});

test("editar pagado sin tocar el estado tampoco lo revive (payload mínimo)", () => {
  storeTest();
  const r = store.editarPedido("d5", { notas: "Entregado" }, U);
  assert.ok(r.ok);
  const despues = store.pedidoPorId("d5");
  assert.equal(despues.estado, "paid");
  assert.equal(despues.cuotasPagadas, 2);
  assert.equal(despues.notas, "Entregado");
});

test("editar un pedido en cuotas conserva sus cuotas y pasa a pagado al completarlas", () => {
  storeTest();
  /* d3 = due, 3 cuotas, 1 pagada */
  const r = store.editarPedido("d3", { cliente: "Lucía", estado: "due", cuotas: 3, cuotasPagadas: 1 }, U);
  assert.equal(r.pedido.estado, "due");
  assert.equal(store.pedidoPorId("d3").cuotasPagadas, 1);
  const completo = store.editarPedido("d3", { cliente: "Lucía", estado: "due", cuotas: 3, cuotasPagadas: 3 }, U);
  assert.equal(completo.pedido.estado, "paid", "cuotas completas → pagado");
  const otra = store.editarPedido("d3", { cliente: "Lucía", estado: "new", cuotas: 2, cuotasPagadas: 0 }, U);
  assert.equal(otra.pedido.estado, "paid", "y sigue pagado en la edición siguiente");
  assert.equal(store.pedidoPorId("d3").cuotasPagadas, 3);
});

test("cada acción devuelve el estado real de la persistencia", () => {
  storeTest(() => ({ ok: true, degradado: true }));
  const r = store.crearPedido({ cliente: "Rosita", items: [{ productoId: "di1" }] }, U);
  assert.ok(r.ok);
  assert.equal(r.persistencia.degradado, true, "la UI puede avisar que se guardó sin fotos");
  const e = store.setEstadoPedido("d3", "paid", U);
  assert.equal(e.persistencia.degradado, true);
});
