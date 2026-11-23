// nav-scroll.js — lógica pura de la nav inferior auto-ocultable (Ropa v2).
// Sin DOM: decide cuándo ocultar/mostrar y cuándo vence la inactividad.
// El cableado (wheel/scroll/touch + rAF) vive en src/main.js.

export const UMBRAL = 8;          // px de gesto para cambiar de dirección
export const ZONA_SUPERIOR = 70;  // cerca del encabezado la nav siempre se ve
export const TOLERANCIA_BORDE = 2;
export const INACTIVIDAD_MS = 3000;
export const REAPARICION_MS = 1500;  // pausa para volver a mostrar la nav oculta (1,5 s)

export const estadoInicial = () => ({
  visible: true,
  scrolleado: false,
  ancla: 0,
  ultimoY: 0,
  ultimaActividad: 0,
  altoVisible: -1,
  altoContenido: -1,
  vencido: false,
  mostradaPorPausa: false,
  ultimaDireccion: 0,   // -1 subiendo, 1 bajando, 0 sin gesto todavía
});

/** Paso de rueda realmente recorrible (un borde no deja movimiento pendiente). */
export function recorridoRueda({ y, altoContenido, altoVisible }, delta) {
  const maximo = Math.max(0, altoContenido - altoVisible);
  return delta < 0 ? (y > 0 ? Math.max(-y, delta) : 0) : Math.min(Math.max(0, maximo - y), delta);
}

/**
 * Merge de una medición contra el estado. `gesto` true = movimiento del usuario;
 * false = salto programático, resize, foco o inercia de borde (no decide).
 * Devuelve un estado NUEVO (inmutable) con `ancla` y `visible` actualizados.
 * La primera medición (sin geometría previa) solo ancla, para no confundir un
 * salto de mount/ruta con un gesto.
 */
export function medirScroll(estado, { y = 0, altoVisible = 0, altoContenido = 0 }, gesto = false) {
  const maximo = Math.max(0, altoContenido - altoVisible);
  const yLim = Math.min(maximo, Math.max(0, y));
  const scrolleado = estado.scrolleado || yLim > ZONA_SUPERIOR;
  const base = { ...estado, ultimoY: yLim, altoVisible, altoContenido, scrolleado };
  const reajuste = estado.altoVisible !== altoVisible || estado.altoContenido !== altoContenido;
  if (!gesto || reajuste) {
    return { ...base, ancla: yLim, visible: estado.visible, vencido: false };
  }
  const delta = yLim - estado.ancla;
  /* Inercia de rueda/touch: el animador sigue emitiendo scroll después del
     gesto, con deltas cada vez más chicos. No revertir la decisión ya tomada
     mientras sigamos yendo en la misma dirección: es el rebote que se veía
     al bajar rápido (se ocultaba, volvía, se volvía a ocultar). */
  if (estado.visible && Math.abs(delta) > UMBRAL &&
      !(estado.ultimaDireccion < 0 && delta < 0) &&
      !(estado.ultimaDireccion > 0 && delta > 0)) {
    base.mostradaPorPausa = false;
  }
  if (yLim <= TOLERANCIA_BORDE || delta < -UMBRAL) {
    return { ...base, ancla: yLim, visible: true, vencido: false, ultimaDireccion: -1 };
  }
  if (yLim > ZONA_SUPERIOR && delta > UMBRAL) {
    return { ...base, ancla: yLim, visible: false, vencido: false, ultimaDireccion: 1 };
  }
  // Pasos chicos (trackpad): conservar el ancla y acumular hasta el umbral.
  return { ...base, ancla: estado.ancla, vencido: false, ultimaDireccion: estado.ultimaDireccion };
}

/** Al vencer la inactividad solo oculta si hay scroll y no hay capa abierta. */
export function ocultarPorInactividad(estado, ahora, capaAbierta = false) {
  if (capaAbierta || estado.mostradaPorPausa || !estado.scrolleado ||
      ahora - estado.ultimaActividad < INACTIVIDAD_MS) return estado;
  return { ...estado, visible: false, vencido: true, ancla: estado.ultimoY };
}

/** Tras una pausa, devuelve la nav sin volver a ocultarla hasta un gesto nuevo. */
export function mostrarPorPausa(estado, ahora, capaAbierta = false) {
  if (capaAbierta || estado.visible || !estado.scrolleado ||
      ahora - estado.ultimaActividad < REAPARICION_MS) return estado;
  return { ...mostrar(estado), mostradaPorPausa: true, ultimaDireccion: 0 };
}

/** Cualquier interacción del usuario: volver a mostrar y reiniciar el ancla. */
export function mostrar(estado) {
  return { ...estado, visible: true, vencido: false, mostradaPorPausa: true,
    ultimaDireccion: 0, ancla: estado.ultimoY };
}

/** Actividad sin gesto de scroll: reinicia el reloj sin cambiar la dirección. */
export function registrarActividad(estado, ahora) {
  return estado.ultimaActividad === ahora ? estado : { ...estado, ultimaActividad: ahora };
}
