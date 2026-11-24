// vista.js — estado de UI (sección activa, filtros, búsqueda, calendario).
// No es datos: es qué está mirando la persona. Vive separado del store.
const oyentes = new Set();
export const vista = {
  seccion: "inicio",
  filtro: "all",
  busqueda: "",
  calMes: new Date().getMonth(),
  calAnio: new Date().getFullYear(),
  diaSel: null,
  verPasadas: false,
  /* agenda: "calendario" (mensual, el de siempre) o "semanas" (franja LU…DO). */
  agendaModo: "calendario",
  logFiltro: "all",
  /* inventario: filtro por categoría, orden y vista (grilla / lista compacta).
     Se recuerda mientras la app está abierta; no se guarda en los datos. */
  invCategoria: "todas",
  invOrden: "alta",
  invVista: "grilla",
};
/* Secciones que la app sabe abrir: es lo que puede venir en el hash.
   La lista vive acá (no en main.js) para poder probar el arranque sin DOM. */
export const SECCIONES = ["inicio", "agenda", "pedidos", "inventario", "contactos", "historial", "ajustes"];

/** Sección pedida en la URL (`#inventario`), o null si no hay o no existe. */
export function seccionDelHash(hash) {
  const id = String(hash || "").trim().replace(/^#/, "").trim();
  return SECCIONES.includes(id) ? id : null;
}

export function suscribirVista(fn) { oyentes.add(fn); return () => oyentes.delete(fn); }
export function emitirVista() { for (const fn of oyentes) { try { fn(vista); } catch (e) { console.error(e); } } }
export function irA(seccion, { filtro } = {}) {
  if (filtro !== undefined) vista.filtro = filtro;
  const cambioSeccion = vista.seccion !== seccion;
  if (cambioSeccion) {
    vista.seccion = seccion;
    /* integra con el botón atrás del navegador: cada sección es una entrada */
    try { history.pushState({ seccion }, "", "#" + seccion); } catch (e) { /* sin history */ }
  }
  if (cambioSeccion || filtro !== undefined) emitirVista();
}
