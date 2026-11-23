// secciones.js — secciones propias de la clienta para ordenar el inventario
// (decisión B aprobada por Nico, 23-nov). Datos puros, sin DOM.
//
// Reglas de la pieza aprobada:
//  · una sola sección por producto (o ninguna = cajón "Sin sección");
//  · borrar una sección NUNCA borra productos: sus artículos vuelven a "Sin sección";
//  · "Sin sección" no se crea, no se renombra y no se borra: siempre está.
import { uid } from "./ids.js";
import { normalizar } from "./buscador.js";

export const SECCION_MAX = 40;
export const SECCION_NOMBRE_MAX = 40;
/** id interno del cajón de los productos que todavía no tienen sección. */
export const SIN_SECCION = null;

/** Nombre listo para guardar (o el error, con el mismo texto que muestra la hoja). */
export function validarNombreSeccion(nombre, secciones = [], { exceptoId = null } = {}) {
  const n = String(nombre || "").trim().replace(/\s+/g, " ");
  if (!n) return { ok: false, error: "Escribí el nombre de la sección" };
  if (n.length > SECCION_NOMBRE_MAX) return { ok: false, error: `El nombre puede tener hasta ${SECCION_NOMBRE_MAX} letras` };
  const choque = secciones.some((s) => s.id !== exceptoId && normalizar(s.nombre) === normalizar(n));
  if (choque) return { ok: false, error: "Ya tenés una sección con ese nombre" };
  return { ok: true, nombre: n };
}

export function seccionNueva(nombre) {
  return { id: uid("sec"), nombre: String(nombre || "").trim().replace(/\s+/g, " ") };
}

/** ¿Existe la sección? (`null` es el cajón "Sin sección", siempre válido). */
export function esSeccion(id, secciones = []) {
  if (id === SIN_SECCION || id === undefined) return true;
  return secciones.some((s) => s.id === id);
}

/** Sección a la que va un producto (la suya, si sigue existiendo). */
export function seccionDeProducto(producto, secciones = []) {
  const id = producto ? producto.seccionId : null;
  if (!id) return null;
  return secciones.some((s) => s.id === id) ? id : null;
}

/**
 * Agrupa el inventario por sección, en el orden de las secciones creadas y con
 * "Sin sección" al final solo si tiene productos. Dentro de cada grupo se
 * conserva el orden de entrada. `buscar` filtra por nombre: mientras se busca,
 * los cajones sin coincidencias no se muestran; sin búsqueda, se muestran todos
 * (aunque estén vacíos) para poder ordenarlos.
 */
export function agruparPorSeccion(inventario = [], secciones = [], { buscar = "" } = {}) {
  const q = normalizar(buscar);
  const visibles = (inventario || []).filter((p) => !q || normalizar(p.name).includes(q));
  const grupos = secciones.map((s) => ({
    id: s.id, nombre: s.nombre, productos: visibles.filter((p) => p.seccionId === s.id),
  }));
  const enGrupo = new Set(grupos.flatMap((g) => g.productos.map((p) => p.id)));
  const sueltos = visibles.filter((p) => !enGrupo.has(p.id));
  if (sueltos.length) grupos.push({ id: SIN_SECCION, nombre: "Sin sección", productos: sueltos });
  return q ? grupos.filter((g) => g.productos.length) : grupos;
}

/** Cuántos productos quedan en una sección (para el borrado y los contadores). */
export function contarEnSeccion(inventario = [], id) {
  return (inventario || []).filter((p) => p.seccionId === id).length;
}
