// pantalla-pedidos.js — lista con filtros por estado (contador), búsqueda y vacíos con salida.
import { esc, qs, qsa } from "../ui/dom.js";
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

  if (!lista.length) main.innerHTML = vacioHTML(vista.busqueda);
  else main.innerHTML = `<div class="stagger">${lista.map(o => cardPedidoHTML(o)).join("")}</div>`;
  cablearCardsPedidos(main, abrirDetalle);
  main.querySelectorAll("[data-acc='nuevo']").forEach(b => b.onclick = () => abrirEditorPedido(null));
}

function pintarChips(cuento) {
  const cont = qs("#chips");
  cont.innerHTML = FILTROS.map(f =>
    `<button class="chip chip-${f.tono} ${vista.filtro === f.id ? "on" : ""}" data-k="${f.id}" aria-pressed="${vista.filtro === f.id}">${f.label} <span class="n">(${cuento[f.id]})</span></button>`).join("");
  qsa(".chip", cont).forEach(ch => ch.onclick = () => { vista.filtro = ch.dataset.k; emitirVista(); });
}

function vacioHTML(q) {
  if (q) return `<div class="vacio anim-entra"><div class="viso">🔍</div><b>Sin resultados</b><p>Nada coincide con “${esc(q)}”. Probá con otro nombre o producto.</p></div>`;
  return `<div class="vacio anim-entra"><div class="viso">🛍️</div><b>Sin pedidos aquí</b><p>Usá el botón + para registrar un pedido: cliente, productos y estado.</p><button class="btn btn-primario" style="max-width:240px;margin:0 auto" data-acc="nuevo">+ Nuevo pedido</button></div>`;
}
