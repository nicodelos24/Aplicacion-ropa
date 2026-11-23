// Barrel del núcleo: cálculos, fábricas, estados, filtros y meta de log.
// nucleo/index.js — dominio puro, sin DOM ni I/O. Una sola fuente de verdad
// para los cálculos; la UI no calcula nada.
//
// Módulos:
//   ids.js        uid()
//   moneda.js     parseMoneda / fmt (gramática validada, P1 UX36-01)
//   fechas.js     dstr / fdate / agenda
//   pedidos.js    pedidos: total, cuotas, estados y transiciones (P1)
//   entidades.js  fábricas: pedido/producto/cliente/evento/log + snapshot por uuid
//   filtros.js    FILTROS, conteo, búsqueda, resúmenes (QA v1: homónimos, no-match)
//   contacto.js   clientes + WhatsApp
//   catalogo.js   categorías con ícono y meta del log
export { uid } from "./ids.js";
export { MESES, parseMoneda, esPrecioValido, fmt, fmtMonto } from "./moneda.js";
export {
  DOW, DSEM, dstr, hoy, desplazarDias, fdate, fdateShort,
  esHoy, esPasado, celdasMes, sumarMes,
} from "./fechas.js";
export {
  ESTADOS, ORDEN_ESTADOS, FILTROS, total, totalLista, cuotasDe, cuotasPagadasDe,
  alPagarCuota, completaCuotas, estadoDe, colorEstado,
  cambiarEstado, cuotaStep, cuotasCompletas, estadoAlGuardar,
  cuotasValidas, cuotasPagadasValidas, CUOTAS_MIN, CUOTAS_MAX, ES_ESTADO,
  requiereConfirmacion, setCuotasDe,
  precioItem, nombreItem, qtyDe, subtotalItem, totalItems, aplicarDatosPedido,
} from "./pedidos.js";
export {
  itemDesdeProducto, itemAMano, normalizarItem,
  pedidoNuevo, pedidoDesdeDatos, productoNuevo, clienteNuevo, eventoNuevo,
  entradaLog, LOG_MAX,
} from "./entidades.js";
export {
  conteoFiltros, buscarPedidos, filtrarPorEstado, resumenCliente,
  resumenGeneral, entregasPorDia, ordenarPedidos,
} from "./filtros.js";
export {
  normalizar, coincidePedido, coincideProducto, coincideCliente,
} from "./buscador.js";
export {
  PREFIJO_DEFECTO, clientePorId, pedidosDe,
  waTel, maskTel, fmtTel, linkWhatsApp, prefijoLimpio,
} from "./contacto.js";
export {
  CATEGORIAS, CATEGORIAS_IDS, CATEGORIA_DEFECTO, esCategoria, categoria,
  iconoCategoria, LOG_META, LOG_ACCIONES,
} from "./catalogo.js";
