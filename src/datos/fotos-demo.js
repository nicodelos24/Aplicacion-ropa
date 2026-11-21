// fotos-demo.js — fotos ficticias SOLO de muestra, superpuestas en la LECTURA.
// Viven en este archivo y en /fotos/*.jpg; NUNCA se guardan en localStorage.
// Se aplican por productoId (di1..di5) tanto en ?demo=1 como en datos viejos ya
// guardados: la clienta ve las fotos sin que sus datos cambien ni se ensucien.
// Quitar este módulo y su uso en store.js revierte toda la funcionalidad.

const POR_PRODUCTO = {
  di1: "./fotos/vestido.jpg", // Vestido floral
  di2: "./fotos/campera.jpg", // Camisa blanca
  di3: "./fotos/jean.jpg",    // Pantalón negro
  di4: "./fotos/bolso.jpg",   // Abrigo largo
  di5: "./fotos/buzo.jpg",    // Medias lanas
};

/** Foto de muestra para un producto, si tiene ID demo; si no, null. */
export function fotoDemoDe(p) {
  return (p && p.id && POR_PRODUCTO[p.id]) || null;
}

/** Foto de muestra para un ítem de pedido, por productoId. */
export function fotoDemoDeItem(i) {
  return (i && i.productoId && POR_PRODUCTO[i.productoId]) || null;
}

/**
 * Vista de solo lectura del estado con las fotos de muestra puestas en los
 * ítems/productos demo. Devuelve copias: el estado guardado queda intacto, así
 * que ninguna acción de la clienta persiste estas fotos como propias.
 */
export function conFotosDemo(d) {
  if (!d) return d;
  return {
    ...d,
    inventory: (d.inventory || []).map(p => {
      const foto = fotoDemoDe(p);
      return foto ? { ...p, photo: foto } : p;
    }),
    orders: (d.orders || []).map(o => ({
      ...o,
      items: (o.items || []).map(i => {
        const foto = fotoDemoDeItem(i);
        return foto ? { ...i, foto } : i;
      }),
    })),
  };
}

/** ¿Esta foto es una de muestra? (para el badge en la UI). */
export function esFotoDemo(src) {
  return !!(src && Object.values(POR_PRODUCTO).includes(src));
}

export const FOTOS_DEMO = POR_PRODUCTO;
