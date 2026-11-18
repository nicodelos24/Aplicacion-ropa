// Persistencia local (localStorage) con degradación: si la foto no entra
// (quota excedida), se reintenta sin fotos y avisamos por el return.
import { pedidoDesdeDatos } from "../nucleo/entidades.js";
import { CATEGORIA_DEFECTO } from "../nucleo/catalogo.js";

export const KEY = "ropa_v2_data";
const SIN_DATOS = () => ({
  orders: [], inventory: [], clients: [], events: [], log: [],
  users: [], usuarioId: "u1", prefijo: "+598", theme: "dark",
});

function sanitizar(d) {
  const arr = (v) => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object" && !Array.isArray(x)) : []);
  const out = SIN_DATOS();
  if (!d || typeof d !== "object") return out;
  out.orders = arr(d.orders);
  out.inventory = arr(d.inventory).map((p) => ({ ...p, cat: p.cat || CATEGORIA_DEFECTO, photo: p.photo ?? null }));
  out.clients = arr(d.clients);
  out.events = arr(d.events);
  out.log = arr(d.log).slice(-600);
  out.users = arr(d.users);
  out.usuarioId = d.usuarioId || "u1";
  out.prefijo = d.prefijo || "+598";
  out.theme = d.theme || "dark";
  return out;
}

/** Carga y normaliza (compat v1: name/price sin productoId se resuelven). */
export function cargar() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return SIN_DATOS();
    const base = sanitizar(JSON.parse(raw));
    base.orders = base.orders.map((o) => pedidoDesdeDatos(o, base.inventory));
    return base;
  } catch {
    return SIN_DATOS();
  }
}

/**
 * Guarda. Devuelve {ok, degradado} — si localStorage llena con las fotos,
 * reintenta sin fotos (degradado:true); si igual falla, ok:false.
 */
export function guardar(data) {
  const intento = (d) => {
    try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch { return false; }
  };
  if (intento(data)) return { ok: true, degradado: false };
  const sinFotos = {
    ...data,
    inventory: (data.inventory || []).map((p) => ({ ...p, photo: null })),
    orders: (data.orders || []).map((o) => ({ ...o, items: (o.items || []).map((i) => ({ ...i, foto: null })) })),
  };
  if (intento(sinFotos)) return { ok: true, degradado: true };
  return { ok: false, degradado: true };
}

export function borrarTodo() {
  try { localStorage.removeItem(KEY); } catch { /* sin localStorage: nada que borrar */ }
  return SIN_DATOS();
}

/** ¿localStorage disponible y escribible? (para avisar modo solo memoria) */
export function disponible() {
  try {
    localStorage.setItem("__ropa_probe", "1");
    localStorage.removeItem("__ropa_probe");
    return true;
  } catch {
    return false;
  }
}
