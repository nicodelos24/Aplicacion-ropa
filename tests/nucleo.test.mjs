// tests/nucleo.test.mjs — dominio puro: total, cuotas, estados, fechas,
// búsqueda, snapshot por uuid (hallazgos P1 UX36-01/02/04).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  total, cuotasDe, cuotasPagadasDe, alPagarCuota, completaCuotas,
  cambiarEstado, cuotaStep, estadoAlGuardar, cuotasValidas,
  CUOTAS_MIN, CUOTAS_MAX, ES_ESTADO, requiereConfirmacion,
} from "../src/nucleo/pedidos.js";
import { conteoFiltros, buscarPedidos, filtrarPorEstado, resumenGeneral, ordenarPedidos } from "../src/nucleo/filtros.js";
import { itemDesdeProducto, normalizarItem, pedidoDesdeDatos, productoNuevo } from "../src/nucleo/entidades.js";
import { waTel, maskTel, fmtTel, linkWhatsApp } from "../src/nucleo/contacto.js";
import { celdasMes, desplazarDias, fdate } from "../src/nucleo/fechas.js";
import { uid } from "../src/nucleo/ids.js";
import { CATEGORIAS_IDS, iconoCategoria } from "../src/nucleo/catalogo.js";

const MIXTO = { items: [{ name: "Pantalón", price: 1400, qty: 1 }, { name: "Medias", price: 0, qty: 2 }] };

test("total: mixto qty2/$0 (QA v1) y homónimos $300", () => {
  assert.equal(total(MIXTO), 1400);
  const homonimos = [
    { items: [{ name: "Vestido", price: 300, qty: 1 }] },
    { items: [{ name: "Vestido", price: 300, qty: 2 }] },
  ];
  assert.equal(total(homonimos[0]), 300);
  assert.equal(total(homonimos[1]), 600);
  assert.equal(total({ items: [] }), 0);
  assert.equal(total({}), 0);
});

test("cuotas: piso 0, techo cuotas, auto-paso a paid al completar", () => {
  const base = { estado: "due", cuotas: 3, cuotasPagadas: 1, items: MIXTO.items };
  assert.equal(cuotaStep(base, -5).cuotasPagadas, 0, "piso 0");
  assert.equal(cuotaStep(base, -5).estado, "due");
  const completo = cuotaStep(cuotaStep(base, 1), 1);
  assert.equal(completo.cuotasPagadas, 3);
  assert.equal(completo.estado, "paid", "completa → paid");
  const alReves = alPagarCuota(base, -1);
  assert.equal(alReves.cuotasPagadas, 0);
});

test("cambiarEstado: paid sella cuotas; due mantiene las suyas", () => {
  const p = cambiarEstado({ estado: "due", cuotas: 3, cuotasPagadas: 1 }, "paid");
  assert.equal(p.estado, "paid");
  assert.equal(p.cuotasPagadas, 3);
  const q = cambiarEstado({ estado: "new", cuotas: 2, cuotasPagadas: 2 }, "due");
  assert.equal(q.cuotasPagadas, 2);
});

test("estadoAlGuardar: due completo → paid (P1)", () => {
  assert.equal(estadoAlGuardar({ estado: "due", cuotas: 2, cuotasPagadas: 2 }), "paid");
  assert.equal(estadoAlGuardar({ estado: "due", cuotas: 3, cuotasPagadas: 2 }), "due");
  assert.equal(estadoAlGuardar({ estado: "new", cuotas: 2, cuotasPagadas: 2 }), "new");
});

test("cuotas válidas 2–12 (pase de QA v1)", () => {
  assert.equal(cuotasValidas(1), null);
  assert.equal(cuotasValidas(2), 2);
  assert.equal(cuotasValidas(12), 12);
  assert.equal(cuotasValidas(13), null);
  assert.equal(CUOTAS_MIN, 2);
  assert.equal(CUOTAS_MAX, 12);
});

test("requiereConfirmacion solo saliendo de paid", () => {
  assert.ok(requiereConfirmacion("paid", "new"));
  assert.ok(!requiereConfirmacion("new", "paid"));
  assert.ok(!requiereConfirmacion("paid", "paid"));
});

test("filtros: conteo, filtrado y orden (flechas + contador de QA v1)", () => {
  const pedidos = [
    { estado: "new", created: 1 }, { estado: "paid", created: 3 },
    { estado: "due", created: 2 }, { estado: "paid", created: 4 },
  ];
  assert.deepEqual(conteoFiltros(pedidos), { all: 4, new: 1, msg: 0, due: 1, paid: 2 });
  assert.equal(filtrarPorEstado(pedidos, "paid").length, 2);
  assert.equal(filtrarPorEstado(pedidos, "all").length, 4);
  assert.deepEqual(ordenarPedidos(pedidos).map((p) => p.created), [4, 3, 2, 1]);
});

test("búsqueda por clienta y producto, no-match → vacío (QA v1)", () => {
  const pedidos = [
    { cliente: "Lucía", items: [{ name: "Pantalón negro", price: 90 }] },
    { cliente: "Rosita", items: [{ name: "Vestido floral", price: 1200 }] },
  ];
  assert.equal(buscarPedidos(pedidos, "90").length, 0, "el precio no se busca (fiel a v1)");
  assert.equal(buscarPedidos(pedidos, "negro").length, 1, "por producto");
  assert.equal(buscarPedidos(pedidos, "floral").length, 1);
  assert.equal(buscarPedidos(pedidos, "lucia").length, 1, "sin acento");
  assert.equal(buscarPedidos(pedidos, "zzz").length, 0, "no-match");
});

test("snapshot por uuid: borrar el producto no deja el pedido sin foto (P1 UX36-02)", () => {
  const producto = productoNuevo({ name: "Vestido floral", price: 1200, photo: "data:foto" });
  const item = itemDesdeProducto(producto, 2);
  assert.equal(item.productoId, producto.id);
  assert.equal(item.foto, "data:foto");
  assert.equal(item.nombre, "Vestido floral");
  // el inventario desaparece: el snapshot queda intacto
  assert.equal(normalizarItem(item, []).foto, "data:foto");
});

test("compat de lectura con datos viejos por nombre (v1)", () => {
  const inventario = [{ id: "i1", name: "Camisa blanca", price: 950, cat: "camisa", photo: "data:f" }];
  const item = normalizarItem({ name: "Camisa blanca", price: 950, qty: 1 }, inventario);
  assert.equal(item.productoId, "i1");
  assert.equal(item.foto, "data:f");
  const sinMatch = normalizarItem({ name: "Otro", price: 5 }, inventario);
  assert.equal(sinMatch.productoId, null);
  assert.equal(sinMatch.foto, null);
});

test("pedidoDesdeDatos normaliza pedidos v1 completos", () => {
  const inventario = [{ id: "i1", name: "Pantalón negro", price: 1400, cat: "pantalon", photo: null }];
  const p = pedidoDesdeDatos({
    id: "d3", created: 123, cliente: "Lucía", tel: "099000111", estado: "due",
    cuotas: 3, cuotasPagadas: 1, fecha: "2026-11-24",
    items: [{ name: "Pantalón negro", price: 1400, qty: 1 }],
  }, inventario);
  assert.equal(p.items[0].productoId, "i1");
  assert.equal(p.items[0].precio, 1400);
  assert.equal(p.estado, "due");
});

test("WhatsApp: 099111222 → 59899111222, con y sin prefijo tipeado", () => {
  assert.equal(waTel("099111222"), "59899111222");
  assert.equal(waTel("+59899111222"), "59899111222", "mismo formato que la v1 (sin +)");
  assert.equal(waTel("099 111 222"), "59899111222");
  assert.equal(waTel(""), "");
  assert.equal(maskTel("099111222"), "099 111 222");
  assert.equal(fmtTel("+59899111222"), "099 111 222");
  assert.match(linkWhatsApp("099111222", "hola"), /^https:\/\/wa\.me\/59899111222\?text=/);
});

test("fechas: desplazamiento, formato largo y celdas de mes", () => {
  const d = desplazarDias(0);
  assert.match(d, /^\d{4}-\d{2}-\d{2}$/);
  const celdas = celdasMes(2026, 10); // noviembre 2026: empieza domingo
  assert.ok(celdas.some((c) => c && c.ds === "2026-11-01"));
  assert.ok(celdas.filter(Boolean).length === 30);
  assert.match(fdate("2026-11-24"), /^24 de noviembre/);
  assert.match(fdate("2024-03-05"), / de 2024$/);
});

test("uid: únicos y con prefijo", () => {
  const ids = new Set(Array.from({ length: 200 }, () => uid("o")));
  assert.equal(ids.size, 200);
  assert.ok([...ids].every((i) => i.startsWith("o")));
});

test("9 categorías con ícono y defecto 'otro'", () => {
  assert.equal(CATEGORIAS_IDS.length, 9);
  assert.ok(iconoCategoria("vestido") !== undefined);
  assert.equal(iconoCategoria("no-existe"), iconoCategoria("otro"));
});
