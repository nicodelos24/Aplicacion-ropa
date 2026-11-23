// orden.js — filtro por categoría y orden del inventario (decisión 1 aprobada
// por Nico, 23-nov: buscador con filtros y orden + lista compacta «más usados»).
// Datos puros, sin DOM: la pantalla elige, acá se decide el orden.
import { normalizar } from "./buscador.js";

/** Minúsculas y sin tildes: «Pantalón» y «pantalon» son el mismo texto. */
const plano = (s) => normalizar(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
import { CATEGORIAS, esCategoria } from "./catalogo.js";

/** Órdenes ofrecidos. El primero es el de siempre (orden de entrada del inventario). */
export const ORDENES = [
  { id: "alta",       label: "Los últimos" },
  { id: "usados",     label: "Más usados" },
  { id: "az",         label: "Nombre A–Z" },
  { id: "precio-asc", label: "Precio: menor a mayor" },
  { id: "precio-desc", label: "Precio: mayor a menor" },
];
export const ORDEN_DEFECTO = "alta";
export function esOrden(id) { return ORDENES.some((o) => o.id === id); }
export function etiquetaOrden(id) {
  const o = ORDENES.find((x) => x.id === id) || ORDENES.find((x) => x.id === ORDEN_DEFECTO);
  return o.label;
}

/** Categoría elegida (`"todas"`) o una del catálogo; cualquier otra cosa cae en "todas". */
export function categoriaValida(id) {
  return id === "todas" || esCategoria(id) ? id : "todas";
}

/**
 * Cuántas veces aparece cada producto en los pedidos (todas las unidades de
 * todos los ítems, incluidas las de pedidos viejos con snapshot). Es la señal de
 * «más usados»: no se guarda en el producto, se cuenta al pintar.
 */
export function usosPorProducto(pedidos = []) {
  const usos = new Map();
  for (const o of pedidos || []) {
    for (const i of o.items || []) {
      if (!i.productoId) continue;
      usos.set(i.productoId, (usos.get(i.productoId) || 0) + Math.max(1, Math.floor(Number(i.qty) || 1)));
    }
  }
  return usos;
}

/** Filtra por categoría, sin tocar el orden de entrada. */
export function filtrarInventario(inventario = [], categoria = "todas") {
  const cat = categoriaValida(categoria);
  if (cat === "todas") return [...(inventario || [])];
  return (inventario || []).filter((p) => (p.cat || "otro") === cat);
}

/**
 * Ordena una lista de productos. Devuelve una copia: nunca toca el inventario.
 * «Los últimos» y «Más usados» desempatan por nombre para que el resultado sea
 * estable entre repintados (el inventario no tiene fecha de alta).
 */
export function ordenarInventario(inventario = [], orden = ORDEN_DEFECTO, { usos = new Map() } = {}) {
  const lista = [...(inventario || [])];
  const porNombre = (a, b) => plano(a.name).localeCompare(plano(b.name), "es");
  const id = esOrden(orden) ? orden : ORDEN_DEFECTO;
  if (id === "az") return lista.sort(porNombre);
  if (id === "precio-asc") return lista.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0) || porNombre(a, b));
  if (id === "precio-desc") return lista.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0) || porNombre(a, b));
  if (id === "usados") {
    return lista.sort((a, b) => (usos.get(b.id) || 0) - (usos.get(a.id) || 0) || porNombre(a, b));
  }
  /* "alta": tal como se cargaron (el último agregado queda al final, como siempre) */
  return lista;
}

/** Categorías presentes en el inventario, en el orden del catálogo, con su conteo. */
export function categoriasConConteo(inventario = []) {
  const cuenta = new Map();
  for (const p of inventario || []) {
    const c = p.cat || "otro";
    cuenta.set(c, (cuenta.get(c) || 0) + 1);
  }
  return CATEGORIAS
    .filter((c) => cuenta.has(c.id))
    .map((c) => ({ id: c.id, label: c.label, n: cuenta.get(c.id) }));
}

/** ¿Hay un filtro puesto más allá del texto del buscador? */
export function hayFiltro({ categoria = "todas", orden = ORDEN_DEFECTO } = {}) {
  return categoriaValida(categoria) !== "todas" || (esOrden(orden) && orden !== ORDEN_DEFECTO);
}
