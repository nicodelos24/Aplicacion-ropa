// Historial: registro centralizado de movimientos y su lectura con filtro.
import { registrarLog } from "../estado/store.js";
import { LOG_META, LOG_ACCIONES } from "../nucleo/catalogo.js";
import { fmt, total } from "../nucleo/index.js";

export { LOG_META, LOG_ACCIONES };

/** Detalle estándar de pedido: "Cliente · $1.500". */
export function detallePedido(pedido) {
  return `${pedido.cliente || "Sin clienta"} · ${fmt(total(pedido))}`;
}

export function logPedido(accion, pedido, usuario) {
  registrarLog(accion, detallePedido(pedido), usuario);
}

export function logCuota(pedido, usuario) {
  const cuotas = pedido.cuotas || 2;
  registrarLog("quota", `${pedido.cliente || "Sin clienta"} · cuota ${pedido.cuotasPagadas} de ${cuotas}`, usuario);
}

export function logProducto(accion, producto, usuario, desde) {
  registrarLog(accion, `${producto.name} · ${fmt(producto.price)}${desde ? " · desde pedido" : ""}`, usuario);
}

export function logCliente(accion, cliente, usuario) {
  registrarLog(accion, cliente.name, usuario);
}

export function logRespaldo(tipo, usuario) {
  registrarLog("backup", tipo === "import" ? "Respaldo importado" : "Respaldo exportado", usuario);
}

/** Entradas con meta para pintar la lista (icono/label por acción). */
export function entradasConMeta(entradas) {
  return (entradas || []).map((e) => ({ ...e, meta: LOG_META[e.action] || { icono: "•", label: e.action } }));
}

/** Filtro por autor ("all" | userId). */
export function filtrarPorAutor(entradas, autor) {
  if (!autor || autor === "all") return entradas || [];
  return (entradas || []).filter((e) => e.user === autor);
}
