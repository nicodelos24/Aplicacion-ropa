// pedidos.js — dominio puro de pedidos: total, cuotas, estados y transiciones.
import { CATEGORIAS_IDS, CATEGORIA_DEFECTO } from "./catalogo.js";

export const ESTADOS = {
  new:  { l: "Nuevo",           c: "yellow", t: "nuevo" },
  msg:  { l: "Mensaje enviado", c: "orange", t: "mensaje" },
  due:  { l: "En cuotas",       c: "blue",   t: "cuotas" },
  paid: { l: "Pagado",          c: "green",  t: "pagado" },
};

export const ORDEN_ESTADOS = ["new", "msg", "due", "paid"];

/* Los filtros de la franja de Pedidos viven en filtros.js (junto al conteo y la
   búsqueda que los usan): acá estaba una segunda lista en otro formato. */

/** Tono de color por estado, para chips y bordes. Única fuente: ESTADOS. */
export function tonoDe(o) {
  const st = ESTADOS[(o && o.estado) || "new"] || ESTADOS.new;
  return st.c;
}

export function total(o) {
  return totalItems(o && o.items);
}

/** Subtotal de una lista de ítems sueltos (carrito del editor, tarjetas de pedido).
 *  Único punto de cálculo: nadie fuera de este módulo multiplica precio × cantidad. */
export function totalItems(items) {
  return (items || []).reduce((s, i) => s + subtotalItem(i), 0);
}

export function totalLista(lista) {
  return (lista || []).reduce((s, o) => s + total(o), 0);
}

export function cuotasDe(o) { return Number(o.cuotas) || 2; }

export function cuotasPagadasDe(o) { return Number(o.cuotasPagadas) || 0; }

/** Cuota +1: el pedido pasa a pagado solo al completar la última. */
export function alPagarCuota(o, delta = 1) {
  const cuotas = cuotasDe(o);
  const pagadas = Math.min(Math.max(cuotasPagadasDe(o) + delta, 0), cuotas);
  return { ...o, cuotasPagadas: pagadas, estado: pagadas >= cuotas ? "paid" : "due" };
}

/** ¿Se llega a pagado con estas cuotas pagadas? */
export function completaCuotas(o) {
  return cuotasPagadasDe(o) >= cuotasDe(o);
}

export function estadoDe(o) { return ESTADOS[o.estado] || ESTADOS.new; }

/** Puntos de agenda por estado (color semántico). */
export function colorEstado(o) { return estadoDe(o).c; }

/** Fija cuotas (2–12) y re-normaliza pagadas al nuevo techo. */
export function setCuotasDe(o, cuotas) {
  const c = cuotasValidas(cuotas);
  return c === null ? null : { ...o, cuotas: c, cuotasPagadas: Math.min(cuotasPagadasDe(o), c) };
}

/* ---- Reglas de transición (P1: confirmación en cambio de estado, piso 0,
   auto-paso a Pagado al completar cuotas) ---- */

export const CUOTAS_MIN = 2;
export const CUOTAS_MAX = 12;
export const ES_ESTADO = (s) => Object.prototype.hasOwnProperty.call(ESTADOS, s);

export function cuotasValidas(n) {
  const i = Math.floor(Number(n));
  return Number.isFinite(i) && i >= CUOTAS_MIN && i <= CUOTAS_MAX ? i : null;
}

export function cuotasPagadasValidas(n, cuotas) {
  const i = Math.floor(Number(n));
  if (!Number.isFinite(i) || i < 0) return 0;
  return Math.min(i, cuotas);
}

export function cuotasCompletas(o) {
  return cuotasPagadasDe(o) >= cuotasDe(o);
}

/** Cambio directo de estado; al pasar a Pagado se sellan las cuotas. */
export function cambiarEstado(o, nuevo) {
  if (!ES_ESTADO(nuevo)) return o;
  const p = { ...o, estado: nuevo };
  if (nuevo === "paid") {
    p.cuotasPagadas = Math.max(cuotasPagadasValidas(p.cuotasPagadas, cuotasDe(p)), cuotasDe(p));
  }
  return p;
}

/** +1/−1 cuota pagada con piso 0; completa la última → paid. */
export function cuotaStep(o, delta) {
  const cuotas = cuotasDe(o);
  const despues = cuotasPagadasValidas(cuotasPagadasDe(o) + delta, cuotas);
  const p = { ...o, cuotasPagadas: despues };
  if (despues >= cuotas) p.estado = "paid";
  return p;
}

/** Estado final al guardar (P1: due completo → paid). */
export function estadoAlGuardar(o) {
  if (o.estado === "due" && cuotasCompletas(o)) return "paid";
  return o.estado;
}

/**
 * Transición única al guardar (alta y edición comparten esta regla): decide
 * estado y cuotas de un pedido a partir del original y de los datos que llegan.
 * Reglas duras:
 *  - un pedido pagado no se "despaga" guardando una edición. El pago se
 *    revierte desde el detalle, que es donde se pide confirmación explícita;
 *  - pagar sella las cuotas; salir de "En cuotas" descarta las cuotas;
 *  - con las cuotas completas, el pedido pasa a Pagado.
 */
export function aplicarDatosPedido(original, datos) {
  const orig = original || {};
  const d = datos || {};
  const cuotas = cuotasDe({ ...orig, ...d });
  const estadoPedido = ES_ESTADO(d.estado) ? d.estado : (orig.estado || "new");
  if (orig.estado === "paid") return { estado: "paid", cuotasPagadas: cuotasPagadasDe(orig) };
  let cuotasPagadas;
  if (estadoPedido === "paid") {
    cuotasPagadas = cuotas;                                  // pagar sella las cuotas
  } else if (estadoPedido === "due") {
    cuotasPagadas = cuotasPagadasValidas(
      d.cuotasPagadas !== undefined ? d.cuotasPagadas : cuotasPagadasDe(orig), cuotas
    );
  } else {
    cuotasPagadas = 0;                                       // salir de cuotas descarta las cuotas
  }
  return { estado: estadoAlGuardar({ estado: estadoPedido, cuotasPagadas, cuotas }), cuotasPagadas };
}

/** ¿La transición pide confirmación explícita? (paid → otro) */
export function requiereConfirmacion(desde, hasta) {
  return desde === "paid" && hasta !== "paid";
}

/** Precio efectivo de un ítem, en v2 (precio) o v1 (price). */
export function precioItem(i) {
  return Number(i && (i.precio !== undefined ? i.precio : i.price)) || 0;
}

/** Nombre efectivo de un ítem, en v2 (nombre) o v1 (name). */
export function nombreItem(i) {
  return String(i && (i.nombre !== undefined ? i.nombre : i.name)) || "";
}

/** Cantidad efectiva (piso 1). */
export function qtyDe(i) {
  const n = Number(i && i.qty);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export function subtotalItem(i) {
  return precioItem(i) * qtyDe(i);
}

/* ---- Editar UN artículo de un pedido (nombre, precio, tipo de prenda, foto) ----
   Regla única, pura: la usan el store (al guardar) y la hoja del artículo (para
   avisar antes). No toca la cantidad ni los demás artículos, y un precio vacío
   conserva el que ya tenía. El producto del inventario no se toca: esto edita el
   artículo DE ESTE pedido (snapshot), con su productoId como estaba. */
export const PRECIO_INVALIDO = "Precio inválido: solo números y un punto (ej. 1200 o 1250.50)";
export const PRECIO_CERO = "El precio debe ser mayor a $0";

/** Devuelve { ok, item } con el artículo ya normalizado, o { ok:false, campo, error }. */
export function itemEditado(original, datos) {
  const o = original || {};
  const d = datos || {};
  const nombre = String(d.nombre ?? nombreItem(o)).trim();
  if (!nombre) return { ok: false, campo: "nombre", error: "Escribí el nombre del producto" };
  const precio = d.precio === undefined || d.precio === null || d.precio === ""
    ? precioItem(o)
    : d.precio;
  if (typeof precio !== "number" || !Number.isFinite(precio) || precio < 0) {
    return { ok: false, campo: "precio", error: PRECIO_INVALIDO };
  }
  if (precio <= 0) return { ok: false, campo: "precio", error: PRECIO_CERO };
  const pedida = d.categoria ?? o.categoria;
  const categoria = CATEGORIAS_IDS.includes(pedida) ? pedida : CATEGORIA_DEFECTO;
  const foto = d.foto !== undefined ? (d.foto || null) : (o.foto ?? o.photo ?? null);
  return { ok: true, item: { ...o, nombre, precio, categoria, foto } };
}

/** Pedido con el artículo `indice` reemplazado; el resto queda idéntico. */
export function reemplazarItem(pedido, indice, item) {
  const p = pedido || {};
  const items = (p.items || []).map((x, j) => (j === indice ? { ...x, ...item } : x));
  return { ...p, items };
}

/** Pedido con el artículo nuevo al final; el resto queda idéntico. */
export function agregarItem(pedido, item) {
  const p = pedido || {};
  return { ...p, items: [...(p.items || []), item] };
}

