// Store observable: una sola fuente de verdad. Los módulos de UI se suscriben
// y despachan acciones; ninguna pantalla calcula ni muta el estado directo.
// Depende de: nucleo, datos (inyectados, para poder testear sin localStorage).
import { total, fmt } from "../nucleo/nucleo.js";
import { parseMoneda } from "../nucleo/moneda.js";
import {
  ESTADOS, ORDEN_ESTADOS, ES_ESTADO, cambiarEstado, cuotaStep,
  aplicarDatosPedido, cuotasValidas, cuotasPagadasValidas, CUOTAS_MIN,
} from "../nucleo/pedidos.js";
import { CATEGORIAS_IDS, CATEGORIA_DEFECTO } from "../nucleo/catalogo.js";
import {
  itemDesdeProducto, itemAMano, pedidoNuevo, pedidoDesdeDatos, productoNuevo, clienteNuevo,
  eventoNuevo, entradaLog, LOG_MAX, normalizarItem,
} from "../nucleo/entidades.js";
import { conteoFiltros, buscarPedidos, filtrarPorEstado, ordenarPedidos } from "../nucleo/filtros.js";
import { cargar as cargarLocal, guardar as guardarLocal, borrarTodo, disponible } from "../datos/local.js";
import { conFotosDemo } from "../datos/fotos-demo.js";
import { validarNombreSeccion, seccionNueva, esSeccion, contarEnSeccion } from "../nucleo/secciones.js";

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
export const secciones = () => estado.secciones || [];
export const log = () => estado.log;
export const conteo = () => conteoFiltros(estado.orders);
export function pedidosFiltrados(filtro, q) {
  return buscarPedidos(filtrarPorEstado(ordenarPedidos(vistaDemo().orders), filtro), q);
}
/* el editor debe ver el producto real (sin foto de muestra) para no guardarla como propia */
export function productoPorId(id) { return estado.inventory.find((p) => p.id === id) || null; }
export function seccionPorId(id) { return (estado.secciones || []).find((s) => s.id === id) || null; }
export function clientePorId(id) { return estado.clients.find((c) => c.id === id) || null; }
export function pedidoPorId(id) { return vistaDemo().orders.find((p) => p.id === id) || null; }
export function clientePorNombre(nombre) {
  const n = String(nombre || "").trim().toLowerCase();
  if (!n) return null;
  return estado.clients.find((c) => String(c.name).trim().toLowerCase() === n) || null;
}

/* Alta y edición comparten la regla: el vínculo se resuelve por el nombre final.
   Si el nombre no coincide con ninguna clienta, queda sin vínculo (pedido suelto):
   no se crea clienta nueva automáticamente. */
function vincularCliente(pedido) {
  const cl = clientePorNombre(pedido.cliente);
  pedido.clienteId = cl ? cl.id : null;
  return pedido;
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
  /* si el disco rechaza lo que la memoria sí aceptó, la app tiene que decirlo:
     `persistencia` viaja en el resultado de cada acción. */
  const r = persistencia.guardar(proximo) || { ok: true, degradado: false };
  estado = r.ok === false ? previo : proximo;
  emitir();
  return { ok: r.ok !== false, degradado: !!r.degradado };
}

/* ── Acciones de pedidos ── */
/* Alta atómica: los productos nuevos y el pedido entran en UN solo `set`.
   Nada se escribe en `estado` antes de saber que el pedido tiene ítems: si el
   alta falla, el inventario no queda con productos huérfanos. */
export function crearPedido(datos, usuario) {
  const items = datos.items || [];
  const nuevas = [];                                  // productos a mano que faltan del inventario
  const pedido = pedidoNuevo({ ...datos, estado: datos.estado || "new" });
  pedido.items = items.map((i) => {
    if (i.productoId) return itemDesdeProducto(productoPorId(i.productoId) || { id: i.productoId, name: i.nombre, price: i.precio, photo: i.foto, cat: i.categoria }, i.qty);
    // a mano: nombre → entra solo al inventario si no existe
    const nm = String(i.nombre || "").trim();
    const existente = clienteProductoPorNombre(nm) || nuevas.find((p) => p.name.trim().toLowerCase() === nm.toLowerCase());
    if (!existente) {
      const producto = productoNuevo({ name: nm, price: i.precio, photo: i.foto });
      nuevas.push(producto);
      return itemDesdeProducto(producto, i.qty);
    }
    return { ...itemDesdeProducto(existente, i.qty), foto: i.foto || existente.photo || null };
  });
  if (!pedido.items.length) return { ok: false, error: "Agrega al menos un producto" };
  vincularCliente(pedido);
  const { estado: fin, cuotasPagadas } = aplicarDatosPedido(null, pedido);
  pedido.estado = fin;
  pedido.cuotasPagadas = cuotasPagadas;
  const detalle = `${pedido.cliente} · ${fmt(total(pedido))}`;
  const r = set((d) => {
    if (nuevas.length) d.inventory = [...d.inventory, ...nuevas];
    d.orders = [...d.orders, pedido];
  }, { log: "order_new", detail: detalle, usuario });
  return { ok: r.ok, error: r.ok ? undefined : "No se pudo guardar en el dispositivo", pedido, nuevosProductos: nuevas.length, persistencia: r };
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
  // El vínculo con la clienta se resuelve por el nombre final (fix clienteId).
  vincularCliente(actualizado);
  /* Estado y cuotas los decide el núcleo, no el spread: un pedido pagado no
     vuelve atrás guardando una edición (el pago se revierte desde el detalle). */
  const { estado: fin, cuotasPagadas } = aplicarDatosPedido(original, actualizado);
  actualizado.estado = fin;
  actualizado.cuotasPagadas = cuotasPagadas;
  const r = set((d) => { d.orders = d.orders.map((p) => (p.id === id ? actualizado : p)); }, {
    log: "order_edit", detail: `${actualizado.cliente} · ${fmt(total(actualizado))}`, usuario,
  });
  return { ok: r.ok, error: r.ok ? undefined : "No se pudo guardar en el dispositivo", pedido: actualizado, persistencia: r };
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
  const seccionId = esSeccion(datos.seccionId, secciones()) ? datos.seccionId || null : null;
  const p = productoNuevo({ ...datos, price: precio, cat, seccionId });
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
  if (datos.seccionId !== undefined) {
    q.seccionId = esSeccion(datos.seccionId, secciones()) ? datos.seccionId || null : null;
  }
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

/** Mueve un producto a otra sección (o a "Sin sección" con null). No toca nada más. */
export function moverProductoASeccion(id, seccionId, usuario) {
  const p = productoPorId(id);
  if (!p) return { ok: false, error: "Producto inexistente" };
  if (!esSeccion(seccionId, secciones())) return { ok: false, error: "Esa sección ya no existe" };
  const destino = seccionId || null;
  if ((p.seccionId || null) === destino) return { ok: true, producto: p };
  const q = { ...p, seccionId: destino };
  const nombre = destino ? seccionPorId(destino).nombre : "Sin sección";
  const r = set((d) => { d.inventory = d.inventory.map((x) => (x.id === id ? q : x)); }, { log: "inv_move", detail: `${q.name} · ${nombre}`, usuario });
  return { ok: true, producto: q, persistencia: r };
}

/* ── Secciones personalizables del inventario (decisión B) ──
   Borrar una sección NUNCA borra productos: sus artículos vuelven a "Sin sección". */
export function crearSeccion(nombre, usuario) {
  const v = validarNombreSeccion(nombre, secciones());
  if (!v.ok) return v;
  const s = seccionNueva(v.nombre);
  const r = set((d) => { d.secciones = [...(d.secciones || []), s]; }, { log: "sec_new", detail: s.nombre, usuario });
  return { ok: true, seccion: s, persistencia: r };
}

export function renombrarSeccion(id, nombre, usuario) {
  const s = seccionPorId(id);
  if (!s) return { ok: false, error: "Esa sección ya no existe" };
  const v = validarNombreSeccion(nombre, secciones(), { exceptoId: id });
  if (!v.ok) return v;
  if (v.nombre === s.nombre) return { ok: true, seccion: s };
  const q = { ...s, nombre: v.nombre };
  const r = set((d) => { d.secciones = (d.secciones || []).map((x) => (x.id === id ? q : x)); }, { log: "sec_edit", detail: q.nombre, usuario });
  return { ok: true, seccion: q, persistencia: r };
}

/** Borra la sección y pasa sus productos a "Sin sección" (en la misma escritura). */
export function eliminarSeccion(id, usuario) {
  const s = seccionPorId(id);
  if (!s) return { ok: false, error: "Esa sección ya no existe" };
  const movidos = contarEnSeccion(estado.inventory, id);
  const r = set((d) => {
    d.secciones = (d.secciones || []).filter((x) => x.id !== id);
    d.inventory = d.inventory.map((p) => (p.seccionId === id ? { ...p, seccionId: null } : p));
  }, { log: "sec_del", detail: movidos ? `${s.nombre} · ${movidos} a Sin sección` : s.nombre, usuario });
  return { ok: true, movidos, persistencia: r };
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
  /* las secciones vienen del respaldo; si no las trae, se conservan las de esta app
     para que los productos importados no pierdan su cajón */
  const seccionesImportadas = arr(d.secciones)
    .filter((s) => s.id && String(s.nombre || "").trim())
    .map((s) => ({ id: s.id, nombre: String(s.nombre).trim() }));
  const listaSecciones = seccionesImportadas.length ? seccionesImportadas : (estado.secciones || []);
  const idsSeccion = new Set(listaSecciones.map((s) => s.id));
  const proximo = {
    orders: arr(d.orders),
    inventory: arr(d.inventory).map((p) => ({ ...p, seccionId: p.seccionId && idsSeccion.has(p.seccionId) ? p.seccionId : null })),
    clients: arr(d.clients),
    secciones: listaSecciones,
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
