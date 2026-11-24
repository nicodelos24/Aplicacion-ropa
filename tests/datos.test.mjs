// tests/datos.test.mjs — persistencia localStorage con degradación (fotos fuera)
// y arranque del store con localStorage real simulado.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as store from "../src/estado/store.js";
import { datosDemo } from "../src/datos/demo.js";
import { KEY } from "../src/datos/local.js";

/** localStorage mínimo en memoria, con quota opcional. */
function localStorageSim({ quota } = {}) {
  const mapa = new Map();
  return {
    getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
    setItem: (k, v) => {
      if (quota && v.length > quota) throw new Error("QuotaExceededError");
      mapa.set(k, String(v));
    },
    removeItem: (k) => mapa.delete(k),
    _mapa: mapa,
  };
}

const SIN_DATOS = {
  orders: [], inventory: [], clients: [], events: [], log: [], secciones: [],
  users: [], usuarioId: "u1", prefijo: "+598", theme: "dark",
};

function conLS(ls) {
  globalThis.localStorage = ls;
  return () => { delete globalThis.localStorage; };
}

test("carga y guarda redondo en localStorage real (simulado)", async () => {
  const limpiar = conLS(localStorageSim());
  const { cargar, guardar, disponible, borrarTodo } = await import("../src/datos/local.js");
  assert.ok(disponible());
  const demo = datosDemo();
  assert.deepEqual(guardar(demo), { ok: true, degradado: false });
  const cargado = cargar();
  assert.equal(cargado.orders.length, 5);
  assert.equal(cargado.orders[0].items[0].nombre, "Vestido floral");
  assert.equal(cargado.orders[2].items[0].productoId, "di3");
  // borra
  const vacio = borrarTodo();
  assert.equal(vacio.orders.length, 0);
  assert.equal(cargar().orders.length, 0);
  limpiar();
});

test("degradación: sin espacio para fotos reintenta sin fotos (avisa)", async () => {
  const limpiar = conLS(localStorageSim({ quota: 4000 }));
  const { guardar, cargar } = await import("../src/datos/local.js");
  const demo = datosDemo();
  demo.inventory[0].photo = "data:image/jpeg;base64," + "A".repeat(3000);
  const r = guardar(demo);
  assert.deepEqual(r, { ok: true, degradado: true }, "degradó y avisó");
  const cargado = cargar();
  assert.equal(cargado.inventory[0].photo, null);
  assert.equal(cargado.orders.length, 5, "datos vivos siguen");
  limpiar();
});

test("localStorage roto o sin datos: estado vacío sin romper", async () => {
  const roto = { getItem: () => { throw new Error("SecurityError"); }, setItem: () => { throw new Error("SecurityError"); }, removeItem: () => {} };
  const limpiar = conLS(roto);
  const { disponible, cargar } = await import("../src/datos/local.js");
  assert.equal(disponible(), false);
  assert.deepEqual(cargar(), SIN_DATOS);
  limpiar();
});

test("JSON corrupto en localStorage: estado vacío", async () => {
  const ls = localStorageSim();
  ls.setItem("ropa_v2_data", "{roto");
  const limpiar = conLS(ls);
  const { cargar } = await import("../src/datos/local.js");
  assert.deepEqual(cargar(), SIN_DATOS);
  limpiar();
});

test("boot del store con localStorage: carga del disco + persistencia en cada acción", async () => {
  const ls = localStorageSim();
  const limpiar = conLS(ls);
  store.configurar({ guardar: null, cargar: null, disponible: null }); // restaurar default
  const { guardar, cargar, disponible } = await import("../src/datos/local.js");
  store.configurar({ guardar, cargar, disponible });
  store.boot(datosDemo()); // sembrar
  assert.equal(store.pedidos().length, 5);
  store.boot(); // cargar del disco
  assert.equal(store.pedidos().length, 5);
  assert.equal(JSON.parse(ls.getItem("ropa_v2_data")).orders.length, 5);
  store.setEstadoPedido("d3", "paid", { id: "u1", nombre: "Dueña" });
  const enDisco = JSON.parse(ls.getItem("ropa_v2_data"));
  assert.equal(enDisco.orders.find((o) => o.id === "d3").estado, "paid", "cambios van a disco");
  limpiar();
});

test("arranque demo: siembra solo sin estado guardado y conserva los cambios al recargar", async () => {
  const ls = localStorageSim();
  const limpiar = conLS(ls);
  const { guardar, cargar, disponible } = await import("../src/datos/local.js");
  store.configurar({ guardar, cargar, disponible });

  // Misma decisión de arranque que main.js con ?demo=1.
  const arrancarDemo = () => store.boot(!ls.getItem(KEY) ? datosDemo() : null);

  arrancarDemo();
  assert.equal(store.pedidos().length, 5, "primera visita: siembra la demo");
  assert.ok(ls.getItem(KEY), "la siembra queda persistida");

  store.setTema("light");
  store.crearProducto({ name: "Producto de prueba", price: 250 }, { id: "u1", nombre: "Dueña" });
  const pedidosAntes = store.pedidos().length;

  arrancarDemo();
  assert.equal(store.db().theme, "light", "recarga conserva el tema");
  assert.ok(store.productos().some((p) => p.name === "Producto de prueba"), "recarga conserva productos");
  assert.equal(store.pedidos().length, pedidosAntes, "recarga no reemplaza pedidos por la demo");

  // Un estado guardado vacío también es estado: no hay que volver a sembrar.
  guardar({ ...cargar(), orders: [], inventory: [], clients: [], events: [], log: [], secciones: [] });
  arrancarDemo();
  assert.equal(store.pedidos().length, 0, "respeta un estado guardado vacío");
  assert.equal(store.productos().length, 0);
  limpiar();
});
