// tests/monoeda.test.mjs — parser de precio con gramática validada.
// P1 UX36-01 / UX35-02: rechaza 1.2.3, 12..00, abc, -10, 1e3; cero válido.
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMoneda, esPrecioValido, fmt, fmtMonto } from "../src/nucleo/moneda.js";

test("parseMoneda acepta formatos simples y con separadores", () => {
  assert.equal(parseMoneda("1200"), 1200);
  assert.equal(parseMoneda("12,5"), 12.5);
  assert.equal(parseMoneda("  950 "), 950);
  assert.equal(parseMoneda("12.50"), 12.5); // 2 decimales
});

test("parseMoneda: cero válido se preserva", () => {
  assert.equal(parseMoneda("0"), 0);
  assert.equal(parseMoneda("$0"), 0);
  assert.ok(Object.is(parseMoneda("0"), 0)); // no -0, no null
});

test("parseMoneda rechaza gramática inválida (P1)", () => {
  for (const malo of ["1.2.3", "12..00", "abc", "-10", "1e3", "1,2,3", "12,345", "", "   ", ".5", ",5"]) {
    assert.equal(parseMoneda(malo), null, `debía rechazar: ${JSON.stringify(malo)}`);
  }
});

test("parseMoneda rechaza negativos y notación exponencial", () => {
  assert.equal(parseMoneda("-10"), null);
  assert.equal(parseMoneda("1e3"), null);
});

test("esPrecioValido: vacío pasa (opcional), inválido no", () => {
  assert.equal(esPrecioValido(""), true);
  assert.equal(esPrecioValido("12.50"), true);
  assert.equal(esPrecioValido("12..00"), false);
  assert.equal(esPrecioValido("abc"), false);
});

test("formato es-MX con $ y tabulares", () => {
  assert.equal(fmt(1200), "$1,200");
  assert.equal(fmt(0), "$0");
  assert.equal(fmt(null), "$0");
  assert.match(fmtMonto(1234.5), /\$1,234\.5/);
});
