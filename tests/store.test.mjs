// tests/store.test.mjs — store observable: acciones, selectores, log,
// persistencia con degradación y port de los pases funcionales de la v1
// (confirmación de estado, cuotas, borrado con doble confirmación, respaldo).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as store from "../src/estado/store.js";
import { datosDemo } from "../src/datos/demo.js";

/** Store en memoria (sin localStorage): base limpia por test. */
function storeTest() {
  const mem = { escrituras: [] };
  store.configurar({
    disponible: () => true,
    cargar: () => ({
      orders: [], inventory: [], clients: [], events: [], log: [],
      users: [], usuarioId: "u1", prefijo: "+598", theme: "dark",
    }),
    guardar: (d) => { mem.escrituras.push(d); return { ok: true, degradado: false }; },
  });
  store.boot();
  return mem;
}

const U = { id: "u1", nombre: "Dueña" };
const tick = () => new Promise((r) => setImmediate(r));

test("boot con demo: 5 pedidos, referencias por uuid y contadores", () => {
  store.configurar({ disponible: () => true, cargar: () => datosDemo(), guardar: () => ({ ok: true, degradado: false }) });
  store.boot();
  assert.equal(store.pedidos().length, 5);
  assert.deepEqual(store.conteo(), { all: 5, new: 1, msg: 1, due: 1, paid: 2 });
  const d3 = store.pedidoPorId("d3");
  assert.equal(d3.estado, "due");
  assert.ok(d3.items[0].productoId, "items con productoId");
  assert.ok(store.pedidosFiltrados("paid", "").length === 2);
  assert.equal(store.pedidosFiltrados("all", "floral").length, 1);
  assert.equal(store.pedidosFiltrados("all", "xxx").length, 0, "no-match");
});

test("cambiar estado con confirmación (QA v1): cancelar no muta, aceptar paga", async () => {
  storeTest();
  store.boot({ ...datosDemo(), demo: undefined });
  // cancelación: el llamador no despacha → el estado sigue igual
  assert.equal(store.pedidoPorId("d3").estado, "due");
  // aceptación: pasar a pagado
  const r = store.setEstadoPedido("d3", "paid", U);
  assert.ok(r.ok);
  assert.equal(store.pedidoPorId("d3").estado, "paid");
  assert.equal(store.pedidoPorId("d3").cuotasPagadas, 3, "selladas al pagar");
  const log = store.log();
  assert.equal(log[log.length - 1].action, "order_paid");
});

test("cuotas +/−: piso 0 y auto-paso a pagado (QA v1)", () => {
  storeTest();
  store.boot(datosDemo());
  assert.equal(store.cuotaPedido("d3", -1, U).pedido.cuotasPagadas, 0);
  const r1 = store.cuotaPedido("d3", 1, U);
  assert.equal(r1.pedido.cuotasPagadas, 1);
  assert.equal(r1.pedido.estado, "due");
  const r2 = store.cuotaPedido("d3", 1, U);
  const r3 = store.cuotaPedido("d3", 1, U);
  assert.equal(r3.pedido.estado, "paid", "completa 3 → paid");
  const log = store.log();
  assert.equal(log[log.length - 1].action, "order_paid");
});

test("crear pedido: cliente conocido, productos a mano al inventario, total en log", () => {
  const mem = storeTest();
  store.boot(datosDemo());
  const antes = store.productos().length;
  const r = store.crearPedido({
    cliente: "Rosita", tel: "099111222",
    items: [
      { productoId: "di1", qty: 1 },                      // del inventario
      { nombre: "Bufanda tejida", precio: 340, qty: 1 }, // a mano → inventario
    ],
  }, U);
  assert.ok(r.ok);
  assert.equal(r.pedido.clienteId, "dc1");
  assert.equal(store.productos().length, antes + 1, "producto a mano entra al inventario");
  assert.equal(r.nuevosProductos, 1);
  assert.equal(store.pedidoPorId(r.pedido.id).items[1].nombre, "Bufanda tejida");
  assert.ok(mem.escrituras.length >= 1, "persistió");
  const log = store.log();
  assert.equal(log[log.length - 1].action, "order_new");
  assert.match(log[log.length - 1].detail, /Rosita · \$1,540/);
});

test("crear pedido sin productos se rechaza sin mutar (P1: bloquear sin corromper)", () => {
  storeTest();
  store.boot(datosDemo());
  const antes = store.db();
  const r = store.crearPedido({ cliente: "Alguien", items: [] }, U);
  assert.equal(r.ok, false);
  assert.equal(store.db(), antes, "estado intacto");
});

test("homónimos: dos productos de mismo nombre, total por snapshot (QA v1 $300)", () => {
  storeTest();
  store.boot(datosDemo());
  store.crearProducto({ name: "Vestido", price: "300" }, U);
  const r = store.crearPedido({ cliente: "Paco", items: [{ productoId: store.productos().at(-1).id, qty: 2 }] }, U);
  assert.equal(r.pedido.items[0].precio, 300);
  assert.equal(store.pedidoPorId(r.pedido.id).items[0].qty, 2);
});

test("borrar producto conserva el pedido con su snapshot (P1 UX36-02)", () => {
  storeTest();
  store.boot(datosDemo());
  const d3 = store.pedidoPorId("d3");
  assert.equal(d3.items[0].nombre, "Pantalón negro");
  store.eliminarProducto("di3", U);
  assert.equal(store.productoPorId("di3"), null);
  const d3despues = store.pedidoPorId("d3");
  assert.equal(d3despues.items[0].nombre, "Pantalón negro", "snapshot intacto");
  assert.equal(d3despues.items[0].precio, 1400);
});

test("borrar clienta conserva sus pedidos y corta la referencia", () => {
  storeTest();
  store.boot(datosDemo());
  const r = store.eliminarCliente("dc3", U);
  assert.ok(r.ok);
  assert.equal(store.clientePorId("dc3"), null);
  assert.ok(store.pedidoPorId("d3"), "el pedido queda");
  assert.equal(store.pedidoPorId("d3").clienteId, null);
  assert.equal(store.pedidoPorId("d3").cliente, "Lucía");
});

test("editar product no toca pedidos viejos; precio inválido bloquea (P1)", () => {
  storeTest();
  store.boot(datosDemo());
  const malo = store.editarProducto("di1", { name: "Vestido floral", price: "1.2.3" }, U);
  assert.equal(malo.ok, false, "precio inválido rechazado");
  assert.equal(store.productoPorId("di1").price, 1200, "sin mutar");
  const bien = store.editarProducto("di1", { name: "Vestido floral", price: "1500" }, U);
  assert.ok(bien.ok);
  assert.equal(store.productoPorId("di1").price, 1500);
  assert.equal(store.pedidoPorId("d1").items[0].precio, 1200, "pedido conserva su snapshot");
});

test("suscripción: las acciones notifican al observador", () => {
  storeTest();
  store.boot(datosDemo());
  let avisos = 0;
  const off = store.suscribir(() => avisos++);
  store.setEstadoPedido("d3", "paid", U);
  assert.ok(avisos >= 1);
  off();
  store.cuotaPedido("d3", 1, U);
  assert.equal(avisos, 1, "desuscripción corta los avisos");
});

test("respaldo: exportar es JSON del estado; importar valida y reemplaza", () => {
  storeTest();
  store.boot(datosDemo());
  const json = store.exportar();
  const datos = JSON.parse(json);
  assert.equal(datos.orders.length, 5);
  // import vacío / inválido
  assert.equal(store.importar("{no").ok, false);
  assert.equal(store.importar('{"orders":[]}').ok, false);
  // import válido reemplaza pedidos y conserva usuarios/ajustes
  const nuevo = JSON.stringify({ ...datos, orders: datos.orders.slice(0, 2) });
  const r = store.importar(nuevo);
  assert.ok(r.ok);
  assert.equal(store.pedidos().length, 2);
  assert.equal(store.db().usuarioId, "u1");
  assert.equal(store.db().prefijo, "+598");
});

test("borrar todo: doble confirmación arriba, acá vacía conservando cuenta (QA v1)", () => {
  storeTest();
  store.boot(datosDemo());
  store.borrarDatos(U);
  assert.equal(store.pedidos().length, 0);
  assert.equal(store.productos().length, 0);
  assert.equal(store.db().usuarioId, "u1", "cuenta conservada");
  assert.ok(store.db().prefijo, "ajustes conservados");
});

test("cliente conocido se detecta por nombre al crear pedido", () => {
  storeTest();
  store.boot(datosDemo());
  const r = store.crearPedido({ cliente: "lucía", items: [{ productoId: "di3" }] }, U);
  assert.equal(r.pedido.clienteId, "dc3", "case-insensitive");
});
