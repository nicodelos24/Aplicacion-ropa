// pedido-picker.js — selector de productos del pedido en filas compactas por
// sección (decisión Y aprobada por Nico, 23-nov, maqueta de Blas): se elige con
// una fila por prenda dentro de su sección, con badge «elegidos/total» en cada
// cabecera, para no perder el hilo del pedido mientras se elige.
//
// Datos puros, sin DOM: la pantalla pinta, acá se decide el orden y la búsqueda.
// Reglas de la pieza aprobada:
//  · una fila por producto y una sola sección por producto (decisión B);
//  · el orden NO cambia al marcar: nada salta debajo del dedo; el badge y el
//    check dicen qué está elegido (dentro de la sección: más usados primero y,
//    a igualdad, lo último cargado, como el inventario);
//  · las secciones conservan el orden que les dio la clienta;
//  · el buscador filtra lo que se ve pero nunca deselecciona: lo elegido que no
//    coincide sigue a la vista;
//  · «Sin sección» va al final y solo si tiene productos.
import { normalizar } from "./buscador.js";
import { SIN_SECCION } from "./secciones.js";

/** Minúsculas y sin tildes: «Pantalón» y «pantalon» son el mismo texto. */
const plano = (s) => normalizar(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/**
 * Orden de las filas dentro de una sección: más usados en pedidos primero y,
 * a igualdad de uso, el orden de alta del inventario. Devuelve una copia.
 */
export function ordenarParaElegir(productos = [], { usos = new Map() } = {}) {
  return [...(productos || [])]
    .map((p, i) => ({ p, i }))
    .sort((a, b) => {
      const ua = usos.get(a.p.id) || 0;
      const ub = usos.get(b.p.id) || 0;
      if (ua !== ub) return ub - ua;
      return a.i - b.i;
    })
    .map((x) => x.p);
}

/**
 * Grupos del selector del pedido: una entrada por sección creada (en su orden),
 * «Sin sección» al final solo si tiene productos, y la búsqueda aplicada.
 *
 * - `buscar` filtra por nombre dentro de cada sección;
 * - sin búsqueda se muestran todas las secciones (aunque estén vacías) para que
 *   la clienta vea dónde está parada;
 * - con búsqueda se ocultan las secciones sin coincidencias, salvo que tengan
 *   productos elegidos: esos nunca desaparecen de la vista.
 * Cada grupo lleva `elegidos` y `total` (para el badge), `coincide` (cuántos
 * coinciden con la búsqueda, sin contar los elegidos que se mantienen a la
 * vista) y `hayElegidos`.
 */
export function gruposParaElegir(inventario = [], secciones = [], { buscar = "", elegidos = new Set(), usos = new Map() } = {}) {
  const el = elegidos instanceof Set ? elegidos : new Set(elegidos || []);
  const q = plano(buscar);
  const inv = [...(inventario || [])];

  const grupos = (secciones || []).map((s) => ({
    id: s.id,
    nombre: s.nombre,
    productos: inv.filter((p) => p.seccionId === s.id),
  }));
  const enSeccion = new Set(grupos.flatMap((g) => g.productos.map((p) => p.id)));
  const sueltos = inv.filter((p) => !enSeccion.has(p.id));
  if (sueltos.length) grupos.push({ id: SIN_SECCION, nombre: "Sin sección", productos: sueltos });

  return grupos
    .map((g) => {
      const elegidosN = g.productos.filter((p) => el.has(p.id)).length;
      /* lo elegido se ve siempre: si no, filtrar parecería haber borrado el pedido */
      const visibles = g.productos.filter((p) => !q || plano(p.name).includes(q) || el.has(p.id));
      return {
        id: g.id,
        nombre: g.nombre,
        productos: ordenarParaElegir(visibles, { usos }),
        elegidos: elegidosN,
        total: g.productos.length,
        coincide: q ? g.productos.filter((p) => plano(p.name).includes(q)).length : g.productos.length,
        hayElegidos: elegidosN > 0,
      };
    })
    /* con búsqueda: solo lo que coincide (o tiene elegidos) */
    .filter((g) => !q || g.productos.length);
}

/** ¿La búsqueda encontró algo? (para el vacío del selector). */
export function hayResultados(grupos = []) {
  return (grupos || []).some((g) => (g.coincide || 0) > 0);
}

/** Cuántos productos elegidos hay en total (para el contador del pedido). */
export function contarElegidos(elegidos = new Set()) {
  return elegidos instanceof Set ? elegidos.size : new Set(elegidos || []).size;
}
