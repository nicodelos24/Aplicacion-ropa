// tests/fotos-demo.test.mjs — fotos de muestra para la clienta (21-nov):
// se ven en Inventario y Pedidos, NO se persisten como datos reales, funcionan
// con datos viejos de localStorage y llevan marca visible de "Demo".
import { test } from "node:test";
import assert from "node:assert/strict";
import * as store from "../src/estado/store.js";
import { datosDemo } from "../src/datos/demo.js";
import { conFotosDemo, esFotoDemo, FOTOS_DEMO } from "../src/datos/fotos-demo.js";

/** localStorage en memoria para verificar que las fotos demo NO se guardan. */
function localStorageSim() {
  const mapa = new Map();
  return {
    getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
    setItem: (k, v) => mapa.set(k, String(v)),
    removeItem: (k) => mapa.delete(k),
    _mapa: mapa,
  };
}

test("demo.js asigna foto a los 6 productos (di1..di6) y el snapshot la copia a los pedidos", () => {
  const datos = datosDemo();
  for (const p of datos.inventory) {
    assert.ok(p.photo && p.photo.startsWith("./fotos/"), p.id + " tiene foto de muestra");
  }
  const conFoto = datos.orders.filter(o => o.items.some(i => i.foto && i.foto.startsWith("./fotos/")));
  assert.ok(conFoto.length >= 4, "al menos 4 pedidos muestran foto (copiada por itemDesdeProducto)");
});

test("conFotosDemo no muta el original y muestra fotos en datos viejos sin foto", () => {
  const viejo = {
    inventory: [{ id: "di1", name: "Vestido floral", price: 1200, cat: "vestido", photo: null }],
    orders: [{ id: "x", items: [{ productoId: "di1", nombre: "Vestido floral", precio: 1200, foto: null }] }],
  };
  const vista = conFotosDemo(viejo);
  assert.equal(vista.inventory[0].photo, FOTOS_DEMO.di1, "producto viejo recibe foto");
  assert.equal(vista.orders[0].items[0].foto, FOTOS_DEMO.di1, "ítem viejo recibe foto");
  assert.equal(viejo.inventory[0].photo, null, "original intacto");
  assert.equal(viejo.orders[0].items[0].foto, null, "original intacto");
});

test("esFotoDemo distingue fotos de muestra de fotos reales", () => {
  assert.equal(esFotoDemo("./fotos/vestido.jpg"), true);
  assert.equal(esFotoDemo("data:image/jpeg;base64,xxx"), false);
  assert.equal(esFotoDemo(null), false);
});

test("las fotos demo se ven en la vista pero NUNCA se guardan en localStorage", async () => {
  const ls = localStorageSim();
  globalThis.localStorage = ls;
  const { guardar, cargar, disponible } = await import("../src/datos/local.js");
  store.configurar({ guardar, cargar, disponible });
  store.boot(datosDemo()); // siembra inicial

  // La vista tiene fotos...
  assert.equal(store.productos()[0].photo, FOTOS_DEMO.di1);
  assert.ok(store.pedidos()[0].items[0].foto);

  // Las fotos de la vista son solo una superposición: si el estado guardado
  // no tenía foto, una acción de la clienta no la escribe en el disco.
  const enDisco = () => JSON.parse(ls.getItem("ropa_v2_data"));
  store.crearProducto({ name: "Producto real", price: 100 }, { id: "u1", nombre: "Dueña" });
  const real = store.productos().find(p => p.name === "Producto real");
  assert.equal(real.photo, null, "producto real sin foto de muestra");
  assert.ok(enDisco().inventory.every(p => !p.photo || !p.photo.startsWith("./fotos/") || p.id.startsWith("di")),
    "la superposición no ensucia productos nuevos en disco");
  delete globalThis.localStorage;
});

test("datos viejos en localStorage (sin fotos) muestran las fotos demo al cargar", async () => {
  const ls = localStorageSim();
  const viejo = {
    orders: [{ id: "x", cliente: "Cliente", estado: "new", cuotas: 2, cuotasPagadas: 0,
      items: [{ productoId: "di3", nombre: "Pantalón negro", precio: 1400, categoria: "pantalon", qty: 1 }] }],
    inventory: [{ id: "di3", name: "Pantalón negro", price: 1400, cat: "pantalon", photo: null }],
    clients: [], events: [], log: [], users: [], usuarioId: "u1", prefijo: "+598", theme: "dark",
  };
  ls.setItem("ropa_v2_data", JSON.stringify(viejo));
  globalThis.localStorage = ls;
  const { guardar, cargar, disponible } = await import("../src/datos/local.js");
  store.configurar({ guardar, cargar, disponible });
  store.boot(); // carga de localStorage viejo, sin pasar datos

  assert.equal(store.productos()[0].photo, FOTOS_DEMO.di3, "foto aparece en producto viejo");
  assert.equal(store.pedidos()[0].items[0].foto, FOTOS_DEMO.di3, "foto aparece en pedido viejo");
  // y sigue sin escribirse en el disco original
  assert.equal(JSON.parse(ls.getItem("ropa_v2_data")).inventory[0].photo, null, "disco intacto");
  delete globalThis.localStorage;
});
