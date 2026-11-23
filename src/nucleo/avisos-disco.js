// avisos-disco.js — cuándo y cómo avisar que el dispositivo no guardó (o guardó
// sin las fotos). Datos puros: recibe el resultado de persistencia de una acción
// y devuelve el aviso a mostrar, o null si no hay nada que decir.
//
// Antes, si localStorage rechazaba la escritura (cuota llena, modo privado con
// almacenamiento bloqueado), la app seguía como si nada: el cambio se veía en
// pantalla y se perdía al recargar. Ahora cada acción trae su resultado
// ({ok, degradado}) y acá se decide el texto, que main.js pinta en la franja de
// aviso de arriba (role="status").
//
// Textos en voseo, sin tecnicismos: la dueña necesita saber si lo suyo quedó
// guardado y qué puede hacer.

/** Aviso de arranque: el dispositivo no deja guardar (modo solo memoria). */
export function avisoSoloMemoria() {
  return {
    tipo: "error",
    titulo: "No se puede guardar en este dispositivo",
    texto: "La app funciona, pero lo que cargues se pierde al cerrarla. Revisá el espacio libre o los permisos del navegador y volvé a abrirla cuando puedas guardar.",
  };
}

/**
 * Aviso para el resultado de una acción que escribe.
 * Devuelve null cuando no hay nada que avisar.
 */
export function avisoGuardado(r) {
  if (!r) return null;
  if (r.ok === false) {
    return {
      tipo: "error",
      titulo: "No se guardó",
      texto: "El dispositivo rechazó el cambio y no se guardó nada. Probá liberar espacio o cerrar otras pestañas de la app y volvé a intentarlo.",
    };
  }
  if (r.degradado) {
    return {
      tipo: "aviso",
      titulo: "Se guardó sin las fotos",
      texto: "El cambio quedó guardado, pero no entraron las fotos porque el dispositivo está sin espacio. Los datos y los precios están a salvo.",
    };
  }
  return null;
}
