// tests/nav-scroll.test.mjs — decisión pura de la nav inferior: ocultar al
// bajar, reaparecer tras una pausa y no oscilar mientras no hay gestos.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  INACTIVIDAD_MS, REAPARICION_MS, estadoInicial, medirScroll,
  mostrar, mostrarPorPausa, ocultarPorInactividad, registrarActividad,
} from "../src/ui/nav-scroll.js";

const T0 = 1_000_000;
const gestion = { y: 400, altoVisible: 800, altoContenido: 2000 };

function anclado(T = T0) {
  /* Primera medición: solo ancla (sin geometría previa no decide dirección). */
  return registrarActividad(
    medirScroll(estadoInicial(), { y: 0, altoVisible: 800, altoContenido: 2000 }), T,
  );
}

function bajando(estado, y = 400) {
  return medirScroll(estado, { ...gestion, y }, true);
}

test("la nav baja con el gesto y no vuelve a aparecer por una pausa corta", () => {
  let e = anclado();
  e = bajando(e);
  assert.equal(e.visible, false);
  assert.equal(e.scrolleado, true);
  e = mostrarPorPausa(e, T0 + REAPARICION_MS - 1);
  assert.equal(e.visible, false);
});

test("tras la pausa la nav vuelve sola, con la misma suavidad (sin cambio de estilo)", () => {
  let e = anclado();
  e = bajando(e);
  e = mostrarPorPausa(e, T0 + REAPARICION_MS);
  assert.equal(e.visible, true);
  assert.equal(e.mostradaPorPausa, true);
  /* No se oculta de nuevo aunque siga quieto: no hay oscilación. */
  e = ocultarPorInactividad(e, T0 + REAPARICION_MS + INACTIVIDAD_MS * 2);
  assert.equal(e.visible, true);
});

test("la reaparición no sucede con una capa abierta ni si no hubo scroll", () => {
  const e = bajando(anclado());
  assert.equal(mostrarPorPausa(e, T0 + REAPARICION_MS, true).visible, false);
  const sinScroll = anclado();
  assert.equal(mostrarPorPausa(sinScroll, T0 + REAPARICION_MS).visible, true);
  assert.equal(mostrarPorPausa(sinScroll, T0 + REAPARICION_MS).mostradaPorPausa, false);
});

test("un gesto nuevo reanuda el ocultamiento por inactividad", () => {
  let e = anclado();
  e = bajando(e);
  e = mostrarPorPausa(e, T0 + REAPARICION_MS);
  e = registrarActividad(e, T0 + REAPARICION_MS + 100);
  e = bajando(e, 500);
  assert.equal(e.visible, false);
  assert.equal(e.mostradaPorPausa, false);
});

test("la inercia al bajar rápido no rebota: pasos chicos no revierten el ocultamiento", () => {
  let e = anclado();
  e = bajando(e, 300);                       // gesto franco abajo → oculta
  assert.equal(e.visible, false);
  /* Los eventos de inercia llegan con deltas menores al umbral; antes se
     acumulaban mal y la nav volvía a aparecer aunque se seguía bajando. */
  for (const y of [304, 308, 312, 318]) {
    e = bajando(e, y);
    assert.equal(e.visible, false, `rebote en y=${y}`);
  }
  /* Un gesto nuevo arriba SÍ la muestra. */
  e = medirScroll(e, { ...gestion, y: 200 }, true);
  assert.equal(e.visible, true);
});

test("subir vuelve a mostrar la nav y un toque la deja visible sin oscilar", () => {
  let e = anclado();
  e = bajando(e);
  e = medirScroll(e, { ...gestion, y: 120 }, true);
  assert.equal(e.visible, true);
  const tocada = mostrar(bajando(anclado()));
  assert.equal(tocada.visible, true);
  assert.equal(tocada.mostradaPorPausa, true);
  assert.equal(ocultarPorInactividad(tocada, T0 + INACTIVIDAD_MS * 3).visible, true);
});
