// Datos demo fijos para ?demo=1 (mismo espíritu que la v1, forma v2 con
// productoId + snapshot). Fechas relativas a hoy para que la agenda siempre
// tenga pasado, presente y futuro.
import { desplazarDias } from "../nucleo/fechas.js";
import { itemDesdeProducto } from "../nucleo/entidades.js";

export function datosDemo() {
  const di1 = "di1", di2 = "di2", di3 = "di3", di4 = "di4", di5 = "di5";
  const inventory = [
    { id: di1, name: "Vestido floral", price: 1200, cat: "vestido", photo: null },
    { id: di2, name: "Camisa blanca", price: 950, cat: "camisa", photo: null },
    { id: di3, name: "Pantalón negro", price: 1400, cat: "pantalon", photo: null },
    { id: di4, name: "Abrigo largo", price: 3200, cat: "abrigo", photo: null },
    { id: di5, name: "Medias lanas", price: 250, cat: "media", photo: null },
  ];
  const clients = [
    { id: "dc1", name: "Rosita", tel: "099111222", notas: "" },
    { id: "dc2", name: "Paco", tel: "098765432", notas: "" },
    { id: "dc3", name: "Lucía", tel: "099000111", notas: "" },
    { id: "dc4", name: "María Fernanda", tel: "", notas: "" },
  ];
  const pedido = (o) => o;
  const orders = [
    pedido({
      id: "d1", created: Date.now() - 86400000 * 9, cliente: "Rosita", clienteId: "dc1", tel: "099111222",
      estado: "new", cuotas: 2, cuotasPagadas: 0, notas: "", fecha: desplazarDias(2),
      items: [itemDesdeProducto(inventory[0])],
    }),
    pedido({
      id: "d2", created: Date.now() - 86400000 * 6, cliente: "Paco", clienteId: "dc2", tel: "098765432",
      estado: "msg", cuotas: 2, cuotasPagadas: 0, notas: "Entregar en el trabajo", fecha: desplazarDias(4),
      items: [itemDesdeProducto(inventory[1]), itemDesdeProducto({ id: di5, name: "Corbata", price: 300, cat: "otro", photo: null })],
    }),
    pedido({
      id: "d3", created: Date.now() - 86400000 * 4, cliente: "Lucía", clienteId: "dc3", tel: "099000111",
      estado: "due", cuotas: 3, cuotasPagadas: 1, notas: "", fecha: desplazarDias(7),
      items: [itemDesdeProducto(inventory[2])],
    }),
    pedido({
      id: "d4", created: Date.now() - 86400000 * 15, cliente: "Rosita", clienteId: "dc1", tel: "099111222",
      estado: "paid", cuotas: 2, cuotasPagadas: 2, notas: "", fecha: "",
      items: [{ ...itemDesdeProducto(inventory[4]), qty: 2 }],
    }),
    pedido({
      id: "d5", created: Date.now() - 86400000 * 2, cliente: "María Fernanda", clienteId: "dc4", tel: "",
      estado: "paid", cuotas: 2, cuotasPagadas: 2, notas: "Pagó todo junto", fecha: desplazarDias(1),
      items: [itemDesdeProducto(inventory[3])],
    }),
  ];
  const log = [
    { ts: Date.now() - 86400000 * 6, user: "u1", who: "Dueña", action: "client_new", detail: "Lucía" },
    { ts: Date.now() - 86400000 * 5, user: "u2", who: "Socia", action: "order_paid", detail: "María Fernanda · $3.200" },
    { ts: Date.now() - 86400000 * 4, user: "u1", who: "Dueña", action: "inv_new", detail: "Abrigo largo · $3.200" },
    { ts: Date.now() - 86400000 * 3, user: "u2", who: "Socia", action: "order_new", detail: "María Fernanda · $3.200" },
    { ts: Date.now() - 86400000 * 2, user: "u1", who: "Dueña", action: "quota", detail: "Lucía · cuota 1 de 3" },
  ];
  return {
    orders,
    inventory,
    clients,
    events: [],
    log,
    users: [
      { id: "u1", nombre: "Dueña", rol: "admin", email: "demo@ropa.app" },
      { id: "u2", nombre: "Socia", rol: "admin", email: "socia@demo.ropa.app" },
    ],
    usuarioId: "u1",
    prefijo: "+598",
    theme: "dark",
    demo: true,
  };
}
