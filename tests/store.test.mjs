// tests/store.test.mjs — store observable: acciones, selectores, log,
// persistencia con degradación y port de los pases funcionales de la v1
// (confirmación de estado, cuotas, borrado con doble confirmación, respaldo).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as store from "../src/estado/store.js";
import { datosDemo } from "../src/datos/demo.js";
import { total } from "../src/nucleo/pedidos.js";

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
  /* db() devuelve una vista con fotos demo (copia), así que comparamos contenido. */
  assert.deepEqual(store.db(), antes, "estado intacto");
});

test("editar pedido con qty=2 conserva cantidad y total $500 (regresión medias lanas)", () => {
  storeTest();
  store.boot(datosDemo());
  const antes = store.pedidoPorId("d4");
  // d4 = Rosita, 2× Medias lanas ($250 c/u) → $500
  assert.equal(antes.items.length, 1);
  assert.equal(antes.items[0].qty, 2);
  assert.equal(total(antes), 500);

  // el editor guarda mandando los mismos ítems con su qty (d4 está pagado: el
  // estado no lo cambia una edición, lo fija el núcleo)
  const r = store.editarPedido("d4", {
    cliente: "Rosita", estado: "paid", cuotas: 2, cuotasPagadas: 2,
    items: antes.items.map((i) => ({ ...i })),
  }, U);
  assert.ok(r.ok);
  const despues = store.pedidoPorId("d4");
  assert.equal(despues.items.length, 1, "sigue siendo una tarjeta");
  assert.equal(despues.items[0].qty, 2, "conserva la cantidad ×2");
  assert.equal(despues.items[0].precio, 250, "conserva el precio unitario");
  assert.equal(despues.estado, "paid", "sigue pagado: editar no deshace el pago");
  // total calculado con qty sigue siendo $500 (250 × 2)
  assert.equal(total(despues), 500, "el total NO baja a $250");
});

test("editar pedido sin mandar items no borra las cantidades (red de seguridad)", () => {
  storeTest();
  store.boot(datosDemo());
  const r = store.editarPedido("d4", { estado: "new", cuotas: 2, cuotasPagadas: 0 }, U);
  assert.ok(r.ok);
  const despues = store.pedidoPorId("d4");
  assert.equal(despues.items[0].qty, 2, "conserva qty aunque el llamador omita items");
  assert.equal(total(despues), 500);
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

test("editar pedido vincula el clienteId al nombre de una clienta registrada", () => {
  storeTest();
  store.boot(datosDemo());
  /* d2 es de Paco (dc2); se cambia el nombre a Rosita (dc1). */
  assert.equal(store.pedidoPorId("d2").clienteId, "dc2");
  const r = store.editarPedido("d2", { cliente: "Rosita" }, U);
  assert.ok(r.ok);
  assert.equal(r.pedido.clienteId, "dc1", "se resuelve por nombre al editar");
  assert.equal(store.pedidoPorId("d2").clienteId, "dc1", "persistido");
  assert.equal(store.pedidoPorId("d2").cliente, "Rosita");
  /* aparece en la hoja de Rosita y ya no en la de Paco (núcleo de contacto). */
  assert.ok(store.pedidos().filter(p => p.clienteId === "dc1").some(p => p.id === "d2"));
  assert.equal(store.pedidos().filter(p => p.clienteId === "dc2").some(p => p.id === "d2"), false);
});

test("editar pedido con nombre nuevo deja el vínculo sin clienta (pedido suelto)", () => {
  storeTest();
  store.boot(datosDemo());
  const r = store.editarPedido("d2", { cliente: "Clienta Nueva Sin Registro" }, U);
  assert.ok(r.ok);
  assert.equal(r.pedido.clienteId, null, "nombre nuevo no se vincula");
  assert.equal(store.pedidoPorId("d2").clienteId, null, "persistido sin vínculo");
  assert.equal(store.clientePorNombre("Clienta Nueva Sin Registro"), null, "no se crea clienta automáticamente");
});

test("editar pedido resuelve clienteId con mayúsculas/espacios y conserva el id del pedido", () => {
  storeTest();
  store.boot(datosDemo());
  const r = store.editarPedido("d2", { cliente: "  LUCÍA  " }, U);
  assert.ok(r.ok);
  assert.equal(r.pedido.clienteId, "dc3", "case-insensitive y sin espacios");
  assert.equal(r.pedido.id, "d2", "no cambia la identidad del pedido");
  assert.ok(r.pedido.created, "conserva la fecha de creación");
});

/* ---- editar un artículo del pedido (doble toque → «Editar este artículo») ---- */

test("editarItemPedido: guarda nombre, precio y tipo en ESE pedido y conserva cantidad y vínculo", () => {
  const mem = storeTest();
  store.boot(datosDemo());
  const antes = store.pedidoPorId("d2");                 // Paco: Camisa blanca $950 + Corbata $300
  const r = store.editarItemPedido("d2", 0, { nombre: "Camisa blanca", precio: 1200.5, categoria: "camisa" }, U);
  assert.equal(r.ok, true);
  const despues = store.pedidoPorId("d2");
  assert.equal(despues.items[0].precio, 1200.5, "precio con decimales guardado");
  assert.equal(despues.items[0].qty, antes.items[0].qty, "la cantidad no cambia");
  assert.equal(despues.items[0].productoId, antes.items[0].productoId, "el vínculo con el inventario queda");
  assert.equal(despues.items[1].precio, 300, "los demás artículos no se tocan");
  assert.equal(despues.estado, antes.estado, "el estado del pedido no cambia");
  assert.equal(total(despues), 1200.5 + 300, "el total sale del artículo editado");
  assert.ok(mem.escrituras.length >= 1, "se persiste en el dispositivo");
  assert.equal(store.log().at(-1).action, "order_edit", "queda en el historial");
  /* editar el artículo del pedido no cambia el producto del inventario */
  const producto = store.db().inventory.find((p) => p.id === antes.items[0].productoId);
  assert.equal(producto.price, antes.items[0].precio, "el precio del inventario no se pisa");
});

test("editarItemPedido: rechaza sin tocar el pedido y no escribe", () => {
  const mem = storeTest();
  store.boot(datosDemo());
  const antes = store.pedidoPorId("d2");
  const escrituras = mem.escrituras.length;
  const cero = store.editarItemPedido("d2", 0, { nombre: "Camisa blanca", precio: 0 }, U);
  assert.equal(cero.ok, false);
  assert.equal(cero.campo, "precio", "la hoja sabe qué campo marcar");
  assert.equal(store.editarItemPedido("d2", 9, { nombre: "X", precio: 10 }, U).ok, false, "índice inexistente");
  assert.equal(store.editarItemPedido("nope", 0, { nombre: "X", precio: 10 }, U).ok, false, "pedido inexistente");
  assert.deepEqual(store.pedidoPorId("d2").items, antes.items);
  assert.equal(mem.escrituras.length, escrituras, "un rechazo no persiste nada");
});

test("editarItemPedido: la foto nueva se guarda, el precio vacío conserva el anterior y quitar no guarda la de muestra", () => {
  const mem = storeTest();
  store.boot(datosDemo());
  const antes = store.pedidoPorId("d3");
  assert.ok(antes.items[0].foto, "la lectura muestra la foto de muestra del ítem demo");
  const foto = "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'/%3E";
  const r = store.editarItemPedido("d3", 0, { nombre: antes.items[0].nombre, precio: "", foto }, U);
  assert.equal(r.ok, true);
  assert.equal(r.item.precio, antes.items[0].precio, "precio vacío conserva el que tenía");
  const guardado = (d) => d.orders.find((o) => o.id === "d3").items[0];
  assert.equal(guardado(mem.escrituras.at(-1)).foto, foto, "la foto elegida se persiste");
  /* quitar la foto: las de /fotos son de muestra y nunca se guardan como propias */
  store.editarItemPedido("d3", 0, { foto: null }, U);
  assert.equal(guardado(mem.escrituras.at(-1)).foto, null, "quitar la foto no persiste la de muestra");
});
