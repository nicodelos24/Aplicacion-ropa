// contacto.js — dominio puro de clientes y WhatsApp (prefijo configurable).

export function clientePorId(clients, id) {
  return (clients || []).find(c => c.id === id) || null;
}

/** La app v2 referencia SIEMPRE por clienteId (uuid). Los datos viejos con solo nombre se resuelven en la migración. */
export function pedidosDe(orders, clienteId) {
  return (orders || []).filter(o => o.clienteId === clienteId);
}

export function resumenCliente(orders, clienteId) {
  const os = pedidosDe(orders, clienteId);
  const pend = os.filter(o => o.estado !== "paid").length;
  const hechos = os.length - pend;
  return {
    pedidos: os,
    pendientes: pend,
    hechos,
    texto: os.length === 0 ? "Sin pedidos"
      : pend ? `${pend} pendiente${pend !== 1 ? "s" : ""}` + (hechos ? ` · ${hechos} pedido${hechos !== 1 ? "s" : ""} hecho${hechos !== 1 ? "s" : ""}` : "")
      : `Al día · ${hechos} pedido${hechos !== 1 ? "s" : ""} hecho${hechos !== 1 ? "s" : ""}`,
  };
}

/* ---- WhatsApp ---- */

export const PREFIJO_DEFECTO = "+598";

/** Prefijo normalizado a "+NN" (con defecto si queda vacío). */
export function prefijoLimpio(prefijo) {
  const d = String(prefijo || PREFIJO_DEFECTO).replace(/\D/g, "");
  return d ? "+" + d : PREFIJO_DEFECTO;
}

export function waTel(t, prefijo = PREFIJO_DEFECTO) {
  if (!t) return "";
  const p = prefijoLimpio(prefijo).slice(1);
  const raw = String(t).replace(/\D/g, "");
  if (String(t).trim().startsWith("+") && !raw.startsWith(p) && raw.length >= 8) return raw;
  let d = raw;
  if (p && d.startsWith(p)) d = d.slice(p.length);
  d = d.replace(/^0+/, "");
  if (d.length < 6) return raw;
  return p + d;
}

export function maskTel(v) {
  return (v || "").replace(/\D/g, "").replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

export function fmtTel(t, prefijo = "+598") {
  let d = (t || "").replace(/\D/g, "");
  const p = prefijo.replace(/\D/g, "");
  if (p && d.startsWith(p)) d = d.slice(p.length);
  if (d && d.length >= 8 && !d.startsWith("0")) d = "0" + d;
  return d.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

export function linkWhatsApp(t, texto, prefijo) {
  const tel = waTel(t, prefijo);
  if (!tel) return "";
  return `https://wa.me/${tel}` + (texto ? `?text=${encodeURIComponent(texto)}` : "");
}
