// Persistencia local (localStorage) con degradación: si la foto no entra
// (quota excedida), se reintenta sin fotos y avisamos por el return.
import { pedidoDesdeDatos } from "../nucleo/entidades.js";
import { CATEGORIA_DEFECTO, CATEGORIAS_IDS } from "../nucleo/catalogo.js";
import { ES_ESTADO, CUOTAS_MIN, CUOTAS_MAX, cuotasPagadasValidas } from "../nucleo/pedidos.js";

export const KEY = "ropa_v2_data";
const SIN_DATOS = () => ({
  orders: [], inventory: [], clients: [], events: [], log: [], secciones: [],
  users: [], usuarioId: "u1", prefijo: "+598", theme: "dark",
});

/* Normalización de datos guardados: un JSON manipulado (o de una versión
   anterior) puede traer objetos donde la app espera strings. La política es
   simple: para campos de texto, SOLO un string se conserva; cualquier otro
   tipo (objeto, array, número, booleano) se deja vacío. Nunca se usa
   String(valor): un objeto se convertiría en "[object Object]" y se colaría
   como si fuera un nombre de clienta válido. Los campos numéricos sí se
   convierten con Number, y los ids nulos/ausentes quedan null. */
const texto = (v) => (typeof v === "string" ? v : "");
const idTexto = (v) => (typeof v === "string" && v ? v : null);
const numero = (v, defecto = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : defecto;
};
const entero = (v, defecto = 0) => Math.trunc(numero(v, defecto));
const fotos = (v) => (typeof v === "string" && v ? v : null);
const arr = (v) => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object" && !Array.isArray(x)) : []);

function sanitizar(d) {
  const out = SIN_DATOS();
  if (!d || typeof d !== "object" || Array.isArray(d)) return out;

  // Secciones primero: su ids determinan qué seccionId del inventario es válido.
  out.secciones = arr(d.secciones)
    .map((s) => ({ id: idTexto(s.id), nombre: texto(s.nombre).trim() }))
    .filter((s) => s.id && s.nombre);
  const idsSeccion = new Set(out.secciones.map((s) => s.id));

  out.inventory = arr(d.inventory).map((p) => {
    const cat = texto(p.cat);
    return {
      ...p,
      id: idTexto(p.id),
      name: texto(p.name),
      price: numero(p.price),
      cat: CATEGORIAS_IDS.includes(cat) ? cat : CATEGORIA_DEFECTO,
      photo: fotos(p.photo),
      seccionId: idsSeccion.has(p.seccionId) ? p.seccionId : null,
    };
  });

  out.clients = arr(d.clients).map((c) => ({
    ...c,
    id: idTexto(c.id),
    name: texto(c.name),
    tel: texto(c.tel),
    notas: texto(c.notas),
    foto: fotos(c.foto),
  }));

  out.orders = arr(d.orders).map((o) => {
    const cuotas = Math.min(CUOTAS_MAX, Math.max(CUOTAS_MIN, entero(o.cuotas, CUOTAS_MIN)));
    return {
      ...o,
      id: idTexto(o.id),
      cliente: texto(o.cliente),
      clienteId: idTexto(o.clienteId),
      tel: texto(o.tel),
      estado: ES_ESTADO(o.estado) ? o.estado : "new",
      cuotas,
      cuotasPagadas: cuotasPagadasValidas(entero(o.cuotasPagadas), cuotas),
      fecha: texto(o.fecha),
      notas: texto(o.notas),
      vendedor: texto(o.vendedor),
      created: numero(o.created, Date.now()),
      items: arr(o.items).map((i) => ({
        productoId: idTexto(i.productoId),
        nombre: texto(i.nombre !== undefined ? i.nombre : i.name),
        precio: numero(i.precio !== undefined ? i.precio : i.price),
        foto: fotos(i.foto !== undefined ? i.foto : i.photo),
        categoria: CATEGORIAS_IDS.includes(texto(i.categoria)) ? texto(i.categoria) : CATEGORIA_DEFECTO,
        qty: Math.max(1, entero(i.qty, 1)),
      })),
    };
  });

  out.events = arr(d.events).map((e) => ({
    ...e,
    id: idTexto(e.id),
    fecha: texto(e.fecha),
    titulo: texto(e.titulo),
    pedidoId: idTexto(e.pedidoId),
  }));

  out.log = arr(d.log).slice(-600).map((l) => ({
    ...l,
    id: idTexto(l.id),
    ts: numero(l.ts, Date.now()),
    user: texto(l.user),
    who: texto(l.who),
    action: texto(l.action),
    detail: texto(l.detail),
  }));

  out.users = arr(d.users).map((u) => ({
    ...u,
    id: idTexto(u.id),
    nombre: texto(u.nombre),
    rol: texto(u.rol),
    email: texto(u.email),
  }));

  out.usuarioId = texto(d.usuarioId) || "u1";
  out.prefijo = texto(d.prefijo) || "+598";
  out.theme = texto(d.theme) || "dark";
  /* `demo` es un dato de la siembra, no un campo del modelo del store; no
     se propaga. */
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
