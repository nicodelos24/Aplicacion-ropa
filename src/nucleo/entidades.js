// Entidades: fábricas de pedidos, productos, clientes, eventos y log.
// Referencias por uuid + snapshot (P1 UX36-02 / UX35-04): el ítem del pedido
// guarda productoId + copia de nombre/precio/foto; leer datos viejos (solo
// nombre) sigue funcionando.
import { uid } from "./ids.js";
import { CUOTAS_MIN, ES_ESTADO } from "./pedidos.js";
import { CATEGORIA_DEFECTO } from "./catalogo.js";

/** Ítem de pedido desde producto del inventario: copia el snapshot. */
export function itemDesdeProducto(producto, cantidad = 1) {
  return {
    productoId: producto.id,
    nombre: producto.name || "",
    precio: Number(producto.price) || 0,
    foto: producto.photo || null,
    categoria: producto.cat || CATEGORIA_DEFECTO,
    qty: Math.max(1, Math.floor(Number(cantidad) || 1)),
  };
}

/** Ítem a mano (el nombre entra solo al inventario al guardar). */
export function itemAMano({ nombre = "", precio = 0, foto = null, qty = 1 } = {}) {
  return { productoId: null, nombre, precio: Number(precio) || 0, foto, categoria: CATEGORIA_DEFECTO, qty: Math.max(1, Math.floor(Number(qty) || 1)) };
}

/**
 * Normaliza el ítem a la forma v2: si es dato viejo (name/price sin productoId)
 * lo mapea y conserva el snapshot que ya traiga. Nunca pierde la foto.
 */
export function normalizarItem(item, inventario = []) {
  const i = item || {};
  if (i.productoId || i.nombre !== undefined) {
    return {
      productoId: i.productoId || null,
      nombre: i.nombre ?? i.name ?? "",
      precio: Number(i.precio ?? i.price) || 0,
      foto: i.foto ?? i.photo ?? null,
      categoria: i.categoria || CATEGORIA_DEFECTO,
      qty: Math.max(1, Math.floor(Number(i.qty) || 1)),
    };
  }
  // solo nombre: compat v1 — sin snapshot guardado, lo resuelve el inventario
  const ex = inventario.find(
    (p) => (p.name || "").trim().toLowerCase() === String(i.name || "").trim().toLowerCase()
  );
  return {
    productoId: ex ? ex.id : null,
    nombre: i.name || "",
    precio: Number(i.price) || 0,
    foto: (ex && ex.photo) || null,
    categoria: ex ? ex.cat || CATEGORIA_DEFECTO : CATEGORIA_DEFECTO,
    qty: Math.max(1, Math.floor(Number(i.qty) || 1)),
  };
}

export function pedidoNuevo({ cliente, tel = "", fecha = "", notas = "", items = [], estado = "new", cuotas = CUOTAS_MIN, vendedor = "" } = {}) {
  return {
    id: uid("o"),
    created: Date.now(),
    cliente: cliente || "",
    clienteId: null,
    tel: tel || "",
    estado: ES_ESTADO(estado) ? estado : "new",
    items: items.map((i) => ({ ...i })),
    cuotas: estado === "due" ? cuotas : CUOTAS_MIN,
    cuotasPagadas: 0,
    fecha: fecha || "",
    notas: notas || "",
    vendedor: vendedor || "",
  };
}

export function pedidoDesdeDatos(datos, inventario = []) {
  const d = datos || {};
  const base = {
    id: d.id || uid("o"),
    created: Number(d.created) || Date.now(),
    cliente: d.cliente || "",
    clienteId: d.clienteId || null,
    tel: d.tel || "",
    estado: ES_ESTADO(d.estado) ? d.estado : "new",
    cuotas: Number(d.cuotas) || CUOTAS_MIN,
    cuotasPagadas: Number(d.cuotasPagadas) || 0,
    fecha: d.fecha || "",
    notas: d.notas || "",
    vendedor: d.vendedor || "",
  };
  base.items = (Array.isArray(d.items) ? d.items : []).map((i) => normalizarItem(i, inventario));
  if (!base.items.length) base.items = [];
  return base;
}

/** Producto del inventario. `seccionId` es la sección propia de la clienta (o null). */
export function productoNuevo({ name, price = 0, cat = CATEGORIA_DEFECTO, photo = null, seccionId = null } = {}) {
  return {
    id: uid("i"),
    name: name || "",
    price: Number(price) || 0,
    cat: cat || CATEGORIA_DEFECTO,
    photo: photo || null,
    seccionId: seccionId || null,
  };
}

export function clienteNuevo({ name, tel = "", notas = "", foto = null } = {}) {
  return { id: uid("c"), name: name || "", tel: tel || "", notas: notas || "", foto: foto || null };
}

export function eventoNuevo({ fecha, titulo = "", pedidoId = null } = {}) {
  return { id: uid("e"), fecha: fecha || "", titulo: titulo || "", pedidoId: pedidoId || null };
}

export function entradaLog(action, detail, usuario) {
  return {
    id: uid("l"),
    ts: Date.now(),
    user: (usuario && usuario.id) || "u1",
    who: (usuario && usuario.nombre) || "Yo",
    action,
    detail: detail || "",
  };
}

export const LOG_MAX = 600;
