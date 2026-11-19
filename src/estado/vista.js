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
};
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
