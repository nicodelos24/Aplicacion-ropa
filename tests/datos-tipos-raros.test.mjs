// tests/datos-tipos-raros.test.mjs — localStorage manipulado con tipos
// inesperados en campos internos: la carga debe normalizar sin convertir
// objetos en "[object Object]" y sin romper las pantallas que consumen strings.
import { test } from "node:test";
import assert from "node:assert/strict";
import { KEY } from "../src/datos/local.js";
import * as store from "../src/estado/store.js";

function localStorageSim() {
  const mapa = new Map();
  return {
    getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
    setItem: (k, v) => mapa.set(k, String(v)),
    removeItem: (k) => mapa.delete(k),
  };
}

function conDatos(datos) {
  const ls = localStorageSim();
  ls.setItem(KEY, JSON.stringify(datos));
  globalThis.localStorage = ls;
  return () => { delete globalThis.localStorage; };
}

async function importarLocal() {
  return import("../src/datos/local.js?tipos-raros=" + Math.random());
}

test("campos internos de clientas con objetos: name/tel/notas/foto quedan strings vacíos o null", async () => {
  const limpiar = conDatos({
    clients: [
      { id: "cMala", name: { x: 1 }, tel: { x: 1 }, notas: { x: 1 }, foto: { x: 1 } },
      { id: "cBuena", name: "Rosita", tel: "099111222", notas: "Demora", foto: null },
    ],
  });
  const { cargar } = await importarLocal();
  const d = cargar();
  const mala = d.clients.find((c) => c.id === "cMala");
  const buena = d.clients.find((c) => c.id === "cBuena");
  assert.equal(mala.name, "", "objeto en name no se convierte en [object Object]");
  assert.equal(mala.tel, "");
  assert.equal(mala.notas, "");
  assert.equal(mala.foto, null);
  assert.equal(buena.name, "Rosita", "el registro válido se conserva");
  assert.equal(buena.tel, "099111222");
  assert.equal(buena.notas, "Demora");
  limpiar();
});

test("el repro de Contactos: cargar clientas con name/tel objeto no lanza y deja strings para toUpperCase/replace", async () => {
  const limpiar = conDatos({
    clients: [{ id: "c1", name: { x: 1 }, tel: { x: 1 } }],
    prefijo: { x: 1 },
  });
  const { cargar, guardar, disponible } = await importarLocal();
  store.configurar({ guardar, cargar, disponible });
  store.boot();
  const c = store.clientes()[0];
  assert.equal(typeof c.name, "string");
  assert.equal(typeof c.tel, "string");
  // Operaciones que antes reventaban (pantalla-contactos.js:30 y contacto.js:53).
  assert.equal(c.name.toLowerCase(), "");
  assert.equal((c.name || "?")[0].toUpperCase(), "?");
  assert.equal(c.tel.replace(/\D/g, ""), "");
  assert.equal(store.db().prefijo, "+598", "prefijo inválido vuelve al default");
  limpiar();
  store.configurar({ guardar: null, cargar: null, disponible: null });
});

test("inventario, secciones y pedidos mixtos: se conservan los válidos y se normalizan los raros", async () => {
  const limpiar = conDatos({
    secciones: [
      { id: "s1", nombre: "Dama" },
      { id: { x: 1 }, nombre: "Sección rota" },
      { id: "sVacia", nombre: { x: 1 } },
    ],
    inventory: [
      { id: "i1", name: "Vestido", price: 1200, cat: "vestido", photo: "./v.jpg", seccionId: "s1" },
      { id: "i2", name: { x: 1 }, price: { x: 1 }, cat: { x: 1 }, photo: { x: 1 }, seccionId: "s1" },
    ],
    orders: [{
      id: "o1", cliente: { x: 1 }, clienteId: { x: 1 }, tel: { x: 1 }, estado: { x: 1 },
      cuotas: { x: 1 }, cuotasPagadas: { x: 1 }, fecha: { x: 1 }, notas: { x: 1 },
      items: [
        { productoId: "i1", nombre: { x: 1 }, precio: { x: 1 }, foto: { x: 1 }, qty: { x: 1 } },
        { productoId: "i2", name: "Item viejo", price: 500, qty: 2 },
      ],
    }],
    usuarioId: { x: 1 },
    theme: { x: 1 },
  });
  const { cargar } = await importarLocal();
  const d = cargar();

  assert.deepEqual(d.secciones, [{ id: "s1", nombre: "Dama" }], "sección con id/nombre raros se descarta");
  assert.equal(d.inventory.length, 2);
  assert.equal(d.inventory[0].name, "Vestido");
  assert.equal(d.inventory[0].seccionId, "s1");
  assert.equal(d.inventory[1].name, "");
  assert.equal(d.inventory[1].price, 0);
  assert.equal(d.inventory[1].cat, "otro");
  assert.equal(d.inventory[1].photo, null);

  const o = d.orders[0];
  assert.equal(o.cliente, "");
  assert.equal(o.clienteId, null);
  assert.equal(o.tel, "");
  assert.equal(o.estado, "new");
  assert.equal(o.cuotas, 2);
  assert.equal(o.cuotasPagadas, 0);
  assert.equal(o.fecha, "");
  assert.equal(o.items.length, 2);
  assert.equal(o.items[0].nombre, "", "productoId no se convierte en string");
  assert.equal(o.items[0].precio, 0);
  assert.equal(o.items[0].qty, 1);
  assert.equal(o.items[1].nombre, "Item viejo", "compat v1 con name/price se conserva");
  assert.equal(o.items[1].qty, 2);
  assert.equal(d.usuarioId, "u1");
  assert.equal(d.theme, "dark");
  limpiar();
});

test("eventos, log y users con campos raros: chips de autor y fechas siguen siendo strings", async () => {
  const limpiar = conDatos({
    events: [{ id: "e1", fecha: { x: 1 }, titulo: { x: 1 }, pedidoId: { x: 1 } }],
    log: [
      { id: "l1", ts: { x: 1 }, user: { x: 1 }, who: "Dueña", action: "order_new", detail: { x: 1 } },
      { id: "l2", who: { x: 1 }, action: { x: 1 } },
    ],
    users: [{ id: "u1", nombre: { x: 1 }, rol: { x: 1 }, email: { x: 1 } }],
  });
  const { cargar } = await importarLocal();
  const d = cargar();
  assert.equal(d.events[0].fecha, "");
  assert.equal(d.events[0].titulo, "");
  assert.equal(d.events[0].pedidoId, null);
  assert.equal(d.log[0].who, "Dueña", "autor válido se conserva");
  assert.equal(d.log[0].detail, "");
  assert.ok(Number.isFinite(d.log[0].ts));
  assert.equal(d.log[1].who, "");
  assert.equal(d.log[1].action, "");
  assert.equal(d.users[0].nombre, "");
  assert.equal(d.users[0].rol, "");
  assert.equal(d.users[0].email, "");
  limpiar();
});

test("array raíz y valores numéricos Verdaderos se conservan; no se inventan [object Object]", async () => {
  const limpiar = conDatos({ clients: [{ id: "c1", name: 123, tel: true }], inventory: [{ id: "i1", name: "Vestido", price: "950", cat: "vestido" }] });
  const { cargar } = await importarLocal();
  const d = cargar();
  assert.equal(d.clients[0].name, "", "número en campo de texto se descarta");
  assert.equal(d.clients[0].tel, "", "booleano en campo de texto se descarta");
  assert.equal(d.inventory[0].price, 950, "campo numérico sí convierte");
  limpiar();
});

test("dados válidos completos sobreviven la normalización sin cambios de valor", async () => {
  const limpiar = conDatos({
    clients: [{ id: "c1", name: "Rosita", tel: "099111222", notas: "Demora", foto: null }],
    inventory: [{ id: "i1", name: "Vestido", price: 1200, cat: "vestido", photo: "./v.jpg", seccionId: null }],
    orders: [{ id: "o1", cliente: "Rosita", clienteId: "c1", estado: "due", cuotas: 3, cuotasPagadas: 1, items: [{ productoId: "i1", nombre: "Vestido", precio: 1200, qty: 2 }] }],
    prefijo: "+598", theme: "light", usuarioId: "u1",
  });
  const { cargar } = await importarLocal();
  const d = cargar();
  assert.equal(d.clients[0].name, "Rosita");
  assert.equal(d.clients[0].tel, "099111222");
  assert.equal(d.clients[0].notas, "Demora");
  assert.equal(d.inventory[0].name, "Vestido");
  assert.equal(d.inventory[0].price, 1200);
  assert.equal(d.orders[0].estado, "due");
  assert.equal(d.orders[0].cuotas, 3);
  assert.equal(d.orders[0].cuotasPagadas, 1);
  assert.equal(d.orders[0].items[0].nombre, "Vestido");
  assert.equal(d.orders[0].items[0].qty, 2);
  assert.equal(d.theme, "light");
  limpiar();
});
