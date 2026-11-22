// Store observable: una sola fuente de verdad. Los módulos de UI se suscriben
// y despachan acciones; ninguna pantalla calcula ni muta el estado directo.
// Depende de: nucleo, datos (inyectados, para poder testear sin localStorage).
import { total, fmt } from "../nucleo/nucleo.js";
import { parseMoneda } from "../nucleo/moneda.js";
import {
  ESTADOS, ORDEN_ESTADOS, ES_ESTADO, cambiarEstado, cuotaStep,
  cuotasCompletas, estadoAlGuardar, cuotasValidas, cuotasPagadasValidas, CUOTAS_MIN,
} from "../nucleo/pedidos.js";
import { CATEGORIAS_IDS, CATEGORIA_DEFECTO } from "../nucleo/catalogo.js";
import {
  itemDesdeProducto, itemAMano, pedidoNuevo, pedidoDesdeDatos, productoNuevo, clienteNuevo,
  eventoNuevo, entradaLog, LOG_MAX, normalizarItem,
} from "../nucleo/entidades.js";
import { conteoFiltros, buscarPedidos, filtrarPorEstado, ordenarPedidos } from "../nucleo/filtros.js";
import { cargar as cargarLocal, guardar as guardarLocal, borrarTodo, disponible } from "../datos/local.js";
import { conFotosDemo } from "../datos/fotos-demo.js";

export const ESTADOS_PEDIDO = ESTADOS;
export const ORDEN = ORDEN_ESTADOS;

const suscriptores = new Set();
let estado = null;
let persistencia = { guardar: guardarLocal, cargar: cargarLocal, disponible: disponible };

/** Sustituye la capa de persistencia (tests, F4 nube). */
export function configurar(p) { persistencia = { ...persistencia, ...p }; }

export function suscribir(fn) {
  suscriptores.add(fn);
  return () => suscriptores.delete(fn);
}
function emitir() { for (const fn of suscriptores) fn(estado); }

function iniciar(datos) {
  estado = datos;
  emitir();
}

/** Arranque: datos pasados (demo/tests) o localStorage; sembrar también persiste (v1). */
export function boot(datos = null) {
  if (datos) {
    iniciar(datos);
    persistencia.guardar(estado);
    return;
  }
  const d = persistencia.disponible() ? persistencia.cargar() : { ...cargarLocal(), _soloMemoria: true };
  iniciar(d);
}

/* ── Lectura (selectores) ──
   Las fotos de muestra se superponen SOLO en la lectura: `estado` (y por lo
   tanto localStorage/exportar) nunca las ve. Las acciones siguen usando
   `estado`, así los datos de la clienta no se contaminan. */
const vistaDemo = () => conFotosDemo(estado);
export const db = () => vistaDemo();
export const pedidos = () => ordenarPedidos(vistaDemo().orders);
export const productos = () => vistaDemo().inventory;
export const clientes = () => estado.clients;
export const eventos = () => estado.events;
export const log = () => estado.log;
export const conteo = () => conteoFiltros(estado.orders);
export function pedidosFiltrados(filtro, q) {
  return buscarPedidos(filtrarPorEstado(ordenarPedidos(vistaDemo().orders), filtro), q);
}
/* el editor debe ver el producto real (sin foto de muestra) para no guardarla como propia */
export function productoPorId(id) { return estado.inventory.find((p) => p.id === id) || null; }
export function clientePorId(id) { return estado.clients.find((c) => c.id === id) || null; }
export function pedidoPorId(id) { return vistaDemo().orders.find((p) => p.id === id) || null; }
export function clientePorNombre(nombre) {
  const n = String(nombre || "").trim().toLowerCase();
  if (!n) return null;
  return estado.clients.find((c) => String(c.name).trim().toLowerCase() === n) || null;
}

/* ── Mutación privada + persistencia ── */
function set(mutador, { log: accion, detail, usuario } = {}) {
  const previo = estado;
  const proximo = { ...previo };
  mutador(proximo, previo);
  if (accion) {
    proximo.log = [...(previo.log || []), entradaLog(accion, detail, usuario || { id: previo.usuarioId, nombre: "Yo" })];
    if (proximo.log.length > LOG_MAX) proximo.log = proximo.log.slice(-LOG_MAX);
  }
  estado = proximo;
  const r = persistencia.guardar(estado);
  emitir();
  return r;
}

/* ── Acciones de pedidos ── */
export function crearPedido(datos, usuario) {
  const inventario = estado.inventory;
  let nuevosProductos = 0;
  const pedido = pedidoNuevo({ ...datos, estado: datos.estado || "new" });
  pedido.items = (datos.items || []).map((i) => {
    if (i.productoId) return itemDesdeProducto(productoPorId(i.productoId) || { id: i.productoId, name: i.nombre, price: i.precio, photo: i.foto, cat: i.categoria }, i.qty);
    // a mano: nombre → entra solo al inventario si no existe
    const nm = String(i.nombre || "").trim();
    const existente = clienteProductoPorNombre(nm);
    if (!existente) {
      estado = { ...estado, inventory: [...estado.inventory, productoNuevo({ name: nm, price: i.precio, photo: i.foto })] };
      nuevosProductos++;
      return itemDesdeProducto(estado.inventory[estado.inventory.length - 1], i.qty);
    }
    return { ...itemDesdeProducto(existente, i.qty), foto: i.foto || existente.photo || null };
  });
  if (!pedido.items.length) return { ok: false, error: "Agrega al menos un producto" };
  const cl = clientePorNombre(pedido.cliente);
  if (cl) pedido.clienteId = cl.id;
  if (pedido.estado === "due") pedido.estado = cuotasCompletas(pedido) ? "paid" : "due";
  pedido.estado = estadoAlGuardar(pedido);
  const r = set((d) => { d.orders = [...d.orders, pedido]; }, {
    log: "order_new", detail: `${pedido.cliente} · ${fmt(total(pedido))}`, usuario,
  });
  return { ok: true, pedido, nuevosProductos, persistencia: r };
}

function clienteProductoPorNombre(nombre) {
  const n = String(nombre || "").trim().toLowerCase();
  if (!n) return null;
  return estado.inventory.find((p) => String(p.name).trim().toLowerCase() === n) || null;
}

export function editarPedido(id, datos, usuario) {
  const original = pedidoPorId(id);
  if (!original) return { ok: false, error: "Pedido inexistente" };
  // Red de seguridad: si el llamador no mandó ítems, se conservan los originales;
  // si los mandó, se normaliza cada uno para no perder su cantidad (qty >= 1).
  const items = Array.isArray(datos.items) && datos.items.length ? datos.items : original.items;
  const actualizado = {
    ...original, ...datos, items: items.map((i) => normalizarItem(i, estado.inventory)),
    id: original.id, created: original.created,
  };
  actualizado.estado = estadoAlGuardar(actualizado);
  const r = set((d) => { d.orders = d.orders.map((p) => (p.id === id ? actualizado : p)); }, {
    log: "order_edit", detail: `${actualizado.cliente} · ${fmt(total(actualizado))}`, usuario,
  });
  return { ok: true, pedido: actualizado, persistencia: r };
}

export function eliminarPedido(id, usuario) {
  const p = pedidoPorId(id);
  if (!p) return { ok: false };
  const r = set((d) => { d.orders = d.orders.filter((x) => x.id !== id); }, {
    log: "order_del", detail: `${p.cliente} · ${fmt(total(p))}`, usuario,
  });
  return { ok: true, persistencia: r };
}

export function setEstadoPedido(id, nuevo, usuario) {
  const p = pedidoPorId(id);
  if (!p || !ES_ESTADO(nuevo)) return { ok: false };
  const q = cambiarEstado(p, nuevo);
  const accion = nuevo === "paid" ? "order_paid" : "order_edit";
  const detail = nuevo === "paid" ? `${p.cliente} · ${fmt(total(p))}` : `${p.cliente} · ${ESTADOS[nuevo].label}`;
  const r = set((d) => { d.orders = d.orders.map((x) => (x.id === id ? q : x)); }, { log: accion, detail, usuario });
  return { ok: true, pedido: q, persistencia: r };
}

export function cuotaPedido(id, delta, usuario) {
  const p = pedidoPorId(id);
  if (!p || p.estado !== "due") return { ok: false };
  const q = cuotaStep(p, delta);
  const cuotas = p.cuotas || CUOTAS_MIN;
  const accion = q.estado === "paid" ? "order_paid" : "quota";
  const detail = q.estado === "paid" ? `${p.cliente} · ${fmt(total(p))}` : `${p.cliente} · cuota ${q.cuotasPagadas} de ${cuotas}`;
  const r = set((d) => { d.orders = d.orders.map((x) => (x.id === id ? q : x)); }, { log: accion, detail, usuario });
  return { ok: true, pedido: q, persistencia: r };
}

export function setCuotasPedido(id, cuotas, usuario) {
  const p = pedidoPorId(id);
  if (!p) return { ok: false, error: "Pedido inexistente" };
  const c = cuotasValidas(cuotas);
  if (c === null) return { ok: false, error: "Entre 2 y 12 cuotas" };
  const q = { ...p, cuotas: c, cuotasPagadas: cuotasPagadasValidas(p.cuotasPagadas, c) };
  const r = set((d) => { d.orders = d.orders.map((x) => (x.id === id ? q : x)); }, { log: "order_edit", detail: `${p.cliente} · ${c} cuotas`, usuario });
  return { ok: true, pedido: q, persistencia: r };
}

/* ── Acciones de inventario ── */
export function crearProducto(datos, usuario) {
  if (!String(datos.name || "").trim()) return { ok: false, error: "Escribí el nombre" };
  const precio = parseMoneda(datos.price);
  if (precio === null) return { ok: false, error: "Precio inválido" };
  const cat = CATEGORIAS_IDS.includes(datos.cat) ? datos.cat : CATEGORIA_DEFECTO;
  const p = productoNuevo({ ...datos, price: precio, cat });
  const r = set((d) => { d.inventory = [...d.inventory, p]; }, { log: "inv_new", detail: `${p.name} · ${fmt(p.price)}`, usuario });
  return { ok: true, producto: p, persistencia: r };
}

export function editarProducto(id, datos, usuario) {
  const p = productoPorId(id);
  if (!p) return { ok: false, error: "Producto inexistente" };
  if (!String(datos.name || "").trim()) return { ok: false, error: "Escribí el nombre" };
  const precio = parseMoneda(datos.price);
  if (precio === null) return { ok: false, error: "Precio inválido" };
  const cat = CATEGORIAS_IDS.includes(datos.cat) ? datos.cat : CATEGORIA_DEFECTO;
  const q = { ...p, name: String(datos.name).trim(), price: precio, cat, photo: datos.photo !== undefined ? datos.photo : p.photo };
  const r = set((d) => { d.inventory = d.inventory.map((x) => (x.id === id ? q : x)); }, { log: "inv_edit", detail: `${q.name} · ${fmt(q.price)}`, usuario });
  return { ok: true, producto: q, persistencia: r };
}

export function eliminarProducto(id, usuario) {
  const p = productoPorId(id);
  if (!p) return { ok: false };
  // los pedidos conservan su snapshot: nada más que quitar del inventario
  const r = set((d) => { d.inventory = d.inventory.filter((x) => x.id !== id); }, { log: "inv_del", detail: p.name, usuario });
  return { ok: true, persistencia: r };
}

/* ── Acciones de clientas ── */
export function crearCliente(datos, usuario) {
  if (!String(datos.name || "").trim()) return { ok: false, error: "Escribí el nombre" };
  if (clientePorNombre(datos.name)) return { ok: false, error: "Ya existe una clienta con ese nombre" };
  const c = clienteNuevo(datos);
  const r = set((d) => { d.clients = [...d.clients, c]; }, { log: "client_new", detail: c.name, usuario });
  return { ok: true, cliente: c, persistencia: r };
}

export function editarCliente(id, datos, usuario) {
  const c = clientePorId(id);
  if (!c) return { ok: false, error: "Clienta inexistente" };
  if (!String(datos.name || "").trim()) return { ok: false, error: "Escribí el nombre" };
  const q = { ...c, name: String(datos.name).trim(), tel: datos.tel !== undefined ? datos.tel : c.tel, notas: datos.notas !== undefined ? datos.notas : c.notas };
  const r = set((d) => { d.clients = d.clients.map((x) => (x.id === id ? q : x)); }, { log: "client_edit", detail: q.name, usuario });
  return { ok: true, cliente: q, persistencia: r };
}

export function eliminarCliente(id, usuario) {
  const c = clientePorId(id);
  if (!c) return { ok: false };
  // sus pedidos se conservan (queda el snapshot de nombre); se corta la referencia
  const r = set((d) => {
    d.clients = d.clients.filter((x) => x.id !== id);
    d.orders = d.orders.map((p) => (p.clienteId === id ? { ...p, clienteId: null } : p));
  }, { log: "client_del", detail: c.name, usuario });
  return { ok: true, persistencia: r };
}

export function setTelCliente(pedidoId, tel, usuario) {
  const p = pedidoPorId(pedidoId);
  if (!p || !p.clienteId) return { ok: false };
  const r = editarCliente(p.clienteId, { tel }, usuario);
  return r.ok ? r : { ok: false };
}

/* ── Eventos (agenda) ── */
export function crearEvento(datos, usuario) {
  if (!datos.fecha) return { ok: false, error: "Elegí una fecha" };
  const e = eventoNuevo(datos);
  const r = set((d) => { d.events = [...d.events, e]; }, { log: "event_new", detail: `${e.fecha}${e.titulo ? " · " + e.titulo : ""}`, usuario });
  return { ok: true, evento: e, persistencia: r };
}

export function eliminarEvento(id, usuario) {
  const r = set((d) => { d.events = d.events.filter((x) => x.id !== id); }, { log: "event_del", detail: "", usuario });
  return { ok: true, persistencia: r };
}

/* ── Ajustes ── */
export function setPrefijo(prefijo, usuario) {
  const r = set((d) => { d.prefijo = prefijo || "+598"; }, { log: null });
  return { ok: true, persistencia: r };
}
export function setTema(tema, usuario) {
  const r = set((d) => { d.theme = tema === "light" ? "light" : "dark"; }, { log: null });
  return { ok: true, persistencia: r };
}

/* ── Destructivas ── */
export function borrarDatos(usuario) {
  const limpio = borrarTodo();
  // conserva usuarios, cuenta y ajustes (como la v1)
  const conservado = {
    ...limpio, users: estado.users, usuarioId: estado.usuarioId,
    prefijo: estado.prefijo, theme: estado.theme,
  };
  estado = conservado;
  const r = persistencia.guardar(estado);
  emitir();
  return { ok: true, persistencia: r };
}

/* ── Import / export (respaldo JSON) ── */
export function exportar() {
  return JSON.stringify(estado, null, 2);
}

export function importar(json, { confirmar } = {}) {
  let d;
  try { d = JSON.parse(json); } catch { return { ok: false, error: "Archivo no válido" }; }
  const arr = (v) => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object" && !Array.isArray(x)) : []);
  if (!Array.isArray(d.orders)) return { ok: false, error: "Archivo no válido" };
  const counts = { orders: arr(d.orders).length, inventory: arr(d.inventory).length, clients: arr(d.clients).length };
  if (!counts.orders && !counts.inventory && !counts.clients) return { ok: false, error: "El respaldo está vacío" };
  if (confirmar && !confirmar(counts)) return { ok: false, cancelado: true };
  const proximo = {
    orders: arr(d.orders), inventory: arr(d.inventory), clients: arr(d.clients),
    events: arr(d.events), log: arr(d.log).slice(-LOG_MAX), users: estado.users,
    usuarioId: estado.usuarioId, prefijo: estado.prefijo || "+598", theme: estado.theme,
  };
  proximo.orders = proximo.orders.map((o) => pedidoDesdeDatos(o, proximo.inventory));
  estado = proximo;
  const r = persistencia.guardar(estado);
  emitir();
  return { ok: true, counts, persistencia: r };
}

export function registrarLog(action, detail, usuario) {
  set(() => {}, { log: action, detail, usuario });
}
