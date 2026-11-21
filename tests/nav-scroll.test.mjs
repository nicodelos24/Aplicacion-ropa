// tests/nav-scroll.test.mjs — lógica pura de la nav auto-ocultable.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  UMBRAL, ZONA_SUPERIOR, INACTIVIDAD_MS, estadoInicial, medirScroll,
  recorridoRueda, ocultarPorInactividad, mostrar, registrarActividad,
} from "../src/ui/nav-scroll.js";

const med = (y, altoContenido = 2000, altoVisible = 700) => ({ y, altoContenido, altoVisible });
const medir = (e, m, gesto = true) => medirScroll(e, m, gesto);
// Ciclo real: ancla en mount, primer gesto (mide y ancla), segundo gesto (decide).
const arrancar = (y) => {
  let e = medir(estadoInicial(), med(y), false);      // mount / ruta
  e = registrarActividad(e, 1000);
  e = medir(e, med(y), true);                         // primer gesto -> ancla
  return e;
};

test("arranca visible y solo se oculta pasado el umbral y la zona superior", () => {
  const e0 = estadoInicial();
  assert.equal(e0.visible, true);
  const e1 = medir(arrancar(60), med(60 + UMBRAL + 1), true);
  assert.equal(e1.visible, true, "zona superior nunca oculta");
  const e2 = medir(arrancar(100), med(100 + UMBRAL + 1), true);
  assert.equal(e2.visible, false, "scroll abajo oculta");
  assert.equal(e2.scrolleado, true);
  const e3 = medir(e2, med(130), true);
  assert.equal(e3.visible, false, "sigue oculta al seguir bajando");
});

test("scroll arriba, llegar al borde y tocar muestran la nav", () => {
  const oculta = medir(arrancar(100), med(100 + UMBRAL + 1), true);
  assert.equal(oculta.visible, false);
  assert.equal(medir(oculta, med(oculta.ultimoY - UMBRAL - 1), true).visible, true, "scroll arriba muestra");
  assert.equal(medir(oculta, med(1), true).visible, true, "cerca del borde siempre se ve");
  assert.equal(mostrar(oculta).visible, true, "toque muestra");
});

test("pasos chicos de trackpad se acumulan desde el ancla", () => {
  let e = registrarActividad(arrancar(100), 1000);
  e = medir(e, med(100 + UMBRAL / 2), true);
  assert.equal(e.visible, true, "medio umbral no decide");
  assert.equal(e.ancla, 100, "ancla conservada");
  e = medir(e, med(100 + UMBRAL + 1), true);
  assert.equal(e.visible, false, "suma de pasos supera el umbral");
});

test("saltos programáticos, resize, foco e inercia de borde no cambian la dirección", () => {
  const visible = registrarActividad(arrancar(100), 1000);
  assert.equal(medir(visible, med(500), false).visible, true, "scrollTo no oculta");
  const oculta = medir(visible, med(100 + UMBRAL + 1), true);
  assert.equal(oculta.visible, false);
  const resize = medir(oculta, { y: 380, altoContenido: 2000, altoVisible: 600 }, false);
  assert.equal(resize.visible, false, "resize no muestra");
  assert.equal(resize.ancla, 380, "reancla tras cambio de geometría");
  assert.equal(medir(oculta, med(500), false).visible, false, "salto por foco no decide");
  assert.equal(recorridoRueda(med(0, 2000, 700), -120), 0, "rueda arriba en el borde no tiene recorrido");
  assert.equal(recorridoRueda(med(1300, 2000, 700), 120), 0, "rueda abajo al final no tiene recorrido");
});

test("inactividad oculta luego de 3s solo si hay scroll y sin capa abierta", () => {
  const quieto = arrancar(200);
  assert.equal(ocultarPorInactividad(quieto, 1000 + INACTIVIDAD_MS - 1).visible, true);
  const vencido = ocultarPorInactividad(quieto, 1000 + INACTIVIDAD_MS);
  assert.equal(vencido.visible, false, "vence tras 3s");
  assert.equal(vencido.vencido, true);
  assert.equal(ocultarPorInactividad(registrarActividad(quieto, 2500), 4000).visible, true, "actividad reinicia reloj");
  assert.equal(ocultarPorInactividad(quieto, 9000, true).visible, true, "capa abierta nunca oculta por tiempo");
  const arriba = arrancar(3);
  assert.equal(ocultarPorInactividad(arriba, 9000).visible, true, "sin scroll no oculta");
  assert.equal(mostrar(vencido).vencido, false);
});

test("cambiar de sección reancla y muestra", () => {
  const oculta = medir(arrancar(400), med(400 + UMBRAL + 1), true);
  assert.equal(oculta.visible, false);
  const nueva = medir({ ...estadoInicial(), scrolleado: true }, med(0), false);
  assert.equal(nueva.visible, true, "nueva sección arranca visible");
  assert.equal(nueva.ancla, 0);
  assert.ok(ZONA_SUPERIOR >= 70, "zona superior cubre el encabezado");
});
