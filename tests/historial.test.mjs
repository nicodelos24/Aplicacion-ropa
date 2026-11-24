// tests/historial.test.mjs — filtro de autores del Historial.
import { test } from "node:test";
import assert from "node:assert/strict";
import { filtrarPorAutor } from "../src/servicios/historial.js";

const entradas = [
  { user: "u1", who: "Dueña", action: "order_new" },
  { user: "u2", who: "Socia", action: "order_paid" },
];

test("Historial: los chips de autor filtran por who, no por user", () => {
  assert.equal(filtrarPorAutor(entradas, "all"), entradas);
  assert.deepEqual(filtrarPorAutor(entradas, "Dueña"), [entradas[0]]);
  assert.deepEqual(filtrarPorAutor(entradas, "Socia"), [entradas[1]]);
  assert.deepEqual(filtrarPorAutor(entradas, "Nadie"), []);
});
