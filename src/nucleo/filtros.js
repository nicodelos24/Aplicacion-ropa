// Filtros, búsquedas y resúmenes (pases de QA de la v1: homónimos $300,
// búsqueda 90/no-match, flechas+contador de filtros, mixto qty2/$0).
import { ESTADOS, nombreItem, total } from "./pedidos.js";

/* ÚNICA lista de filtros de la franja de Pedidos. Los estados salen de
   ESTADOS (etiqueta y tono), así renombrar un estado cambia chip y filtro
   juntos; "Todos" no es un estado y va aparte. */
export const FILTROS = [
  { id: "all", label: "Todos", tono: "neutral" },
  ...["paid", "msg", "due", "new"].map((id) => ({ id, label: ESTADOS[id].l, tono: ESTADOS[id].c })),
];

/** Conteo por filtro, para las flechas + contador de la franja de chips. */
export function conteoFiltros(pedidos) {
  const c = { all: pedidos.length, new: 0, msg: 0, due: 0, paid: 0 };
  for (const p of pedidos) if (c[p.estado] !== undefined) c[p.estado]++;
  return c;
}

/** Búsqueda por cliente y producto, insensible a acentos y mayúsculas. */
function norm(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/** Búsqueda por cliente y producto, como la v1 (inclusión, sin tokenizar). */
export function buscarPedidos(pedidos, q) {
  const t = norm(q).trim();
  if (!t) return pedidos;
  return pedidos.filter((p) => {
    const pajar = norm(p.cliente) + " " + (p.items || []).map((i) => norm(nombreItem(i))).join(" ");
    return pajar.includes(t);
  });
}

export function filtrarPorEstado(pedidos, filtro) {
  if (!filtro || filtro === "all") return pedidos;
  return pedidos.filter((p) => p.estado === filtro);
}

/** Resumen de una clienta: pendientes (no paid) y hechos (paid). */
export function resumenCliente(pedidos, clienteId) {
  const propios = pedidos.filter((p) => p.clienteId === clienteId);
  return {
    pedidos: propios,
    pendientes: propios.filter((p) => p.estado !== "paid"),
    hechos: propios.filter((p) => p.estado === "paid"),
  };
}

/** Total facturado y pendiente (para Inicio). Usa el motor único de `pedidos.js`:
 *  un pedido nunca vale una cosa acá y otra en su tarjeta. */
export function resumenGeneral(pedidos) {
  let cobrado = 0, pendiente = 0;
  for (const p of pedidos) {
    const t = total(p);
    if (p.estado === "paid") cobrado += t;
    else pendiente += t;
  }
  return { cobrado, pendiente, pedidos: pedidos.length };
}

/** Días con entregas para el calendario, agrupados por fecha. */
export function entregasPorDia(pedidos) {
  const dias = {};
  for (const p of pedidos) {
    if (!p.fecha) continue;
    (dias[p.fecha] = dias[p.fecha] || []).push(p);
  }
  return dias;
}

export function ordenarPedidos(pedidos) {
  return [...pedidos].sort((a, b) => (b.created || 0) - (a.created || 0));
}
