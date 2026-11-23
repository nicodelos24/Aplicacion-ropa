// pantalla-pedidos.js — lista con filtros por estado (contador), búsqueda y vacíos con salida.
import { esc, qs, qsa } from "../ui/dom.js";
import { ICONO, VACIO_SVG } from "../ui/iconos.js";
import { fmt } from "../nucleo/nucleo.js";
import { FILTROS } from "../nucleo/filtros.js";
import { pedidos, pedidosFiltrados, conteo, db } from "../estado/store.js";
import { vista, emitirVista } from "../estado/vista.js";
import { cardPedidoHTML, cablearCardsPedidos } from "../ui/componentes/stack.js";
import { totalLista } from "../nucleo/pedidos.js";
import { abrirEditorPedido } from "./pantalla-pedido-editor.js";

export function pintarStats(items) {
  qs("#stats").innerHTML = items.map(({ b, s }) =>
    `<div class="stat"><b class="monto">${b}</b><small>${s}</small></div>`).join("");
}

export function pintarPedidos(main, abrirDetalle) {
  const d = db();
  const lista = pedidosFiltrados(vista.filtro, vista.busqueda);
  const todos = pedidos();
  const pagados = todos.filter(o => o.estado === "paid");
  const pend = todos.filter(o => o.estado !== "paid");
  pintarStats([
    { b: fmt(totalLista(pagados)), s: "Cobrado" },
    { b: fmt(totalLista(pend)), s: "Por cobrar" },
    { b: todos.length, s: "Pedidos" },
  ]);

  pintarChips(conteo());

  if (!lista.length) main.innerHTML = vacioHTML(vista.busqueda, vista.filtro);
  else main.innerHTML = `<div class="stagger pantalla-grilla grilla-cards">${lista.map(o => cardPedidoHTML(o)).join("")}</div>`;
  cablearCardsPedidos(main, abrirDetalle);
  main.querySelectorAll("[data-acc='nuevo']").forEach(b => b.onclick = () => abrirEditorPedido(null));
}

function pintarChips(cuento) {
  const cont = qs("#chips");
  /* El chip activo ya se marca con .on; la transición del estado la anima
     motion.css (chipOn / chipDot), en el mismo tono que el stagger de las
     tarjetas. Acá solo queda el cableado. */
  cont.innerHTML = FILTROS.map(f =>
    `<button class="chip chip-${f.tono} ${vista.filtro === f.id ? "on" : ""}" data-k="${f.id}" aria-pressed="${vista.filtro === f.id}">${f.label} <span class="n">(${cuento[f.id]})</span></button>`).join("");
  qsa(".chip", cont).forEach(ch => ch.onclick = () => { vista.filtro = ch.dataset.k; emitirVista(); });
}

function vacioHTML(q, filtro) {
  if (q) return `<div class="vacio anim-entra"><div class="viso">${VACIO_SVG.buscar}</div><b>Sin resultados</b><p>Nada coincide con “${esc(q)}”. Probá con otro nombre o producto.</p></div>`;
  if (filtro && filtro !== "all") {
    const etiqueta = FILTROS.find(f => f.id === filtro)?.label || filtro;
    return `<div class="vacio anim-entra"><div class="viso">${VACIO_SVG.pedidos}</div><b>No hay pedidos con este filtro</b><p>No hay pedidos en “${esc(etiqueta)}”. Probá con otro filtro o registrá uno nuevo.</p><button class="btn btn-primario btn-vacio" data-acc="nuevo">Nuevo pedido</button></div>`;
  }
  return `<div class="vacio anim-entra"><div class="viso">${VACIO_SVG.pedidos}</div><b>Sin pedidos aquí</b><p>Usá el botón + para registrar un pedido: cliente, productos y estado.</p><button class="btn btn-primario btn-vacio" data-acc="nuevo">Nuevo pedido</button></div>`;
}
