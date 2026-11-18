// pantalla-agenda.js — calendario mensual con puntos por estado, día seleccionado, próximas y pasadas plegadas.
import { esc, qs, qsa } from "../ui/dom.js";
import { ICONO } from "../ui/iconos.js";
import { celdasMes, sumarMes, fdate, hoy, DOW } from "../nucleo/fechas.js";
import { MESES } from "../nucleo/moneda.js";
import { estadoDe } from "../nucleo/pedidos.js";
import { pedidos, db } from "../estado/store.js";
import { vista, emitirVista } from "../estado/vista.js";
import { abrirDetallePedido } from "./pantalla-pedido-detalle.js";
import { abrirEditorPedido } from "./pantalla-pedido-editor.js";
import { cardPedidoHTML } from "../ui/componentes/stack.js";
import { pintarStats } from "./pantalla-pedidos.js";

export function pintarAgenda(main, abrirDetalle) {
  const d = db();
  const todos = pedidos();
  const porFecha = {};
  todos.forEach(o => { if (o.fecha) (porFecha[o.fecha] = porFecha[o.fecha] || []).push(o); });
  pintarStats([{ b: todos.filter(o => o.fecha).length, s: "Entregas agendadas" }]);

  const celdas = celdasMes(vista.calAnio, vista.calMes);
  const t = hoy();

  const filaDia = (ds, conFecha) => (porFecha[ds] || []).map(o => cardPedidoHTML(o, { mostrarFecha: conFecha })).join("");

  const listaHTML = () => {
    const fechas = [...new Set(Object.keys(porFecha))].sort();
    const pasadas = fechas.filter(x => x < t).reverse();
    const futuras = fechas.filter(x => x >= t);
    const otrasF = vista.diaSel ? futuras.filter(x => x !== vista.diaSel) : futuras;
    const otrasP = vista.diaSel ? pasadas.filter(x => x !== vista.diaSel) : pasadas;
    return `
      <div class="sect-titulo">Próximas entregas</div>
      ${otrasF.length ? otrasF.map(ds => filaDia(ds, true)).join("") : `<p style="font-size:13px;color:var(--mut);padding:4px 2px">Nada agendado a futuro.</p>`}
      ${otrasP.length ? `<div class="sect-titulo">Pasadas</div>${otrasP.map(ds => filaDia(ds, true)).join("")}` : ""}`;
  };

  const hayHoy = vista.diaSel && !!(porFecha[vista.diaSel] || []).length;
  const totalOtras = Object.keys(porFecha).filter(x => x !== vista.diaSel).length;
  const plegableHTML = `
    <button class="addp" id="fold-otras" style="margin:2px 0 8px">
      ${ICONO.chevAbajo} ${vista.verPasadas ? "Ocultar otras entregas" : `Ver otras entregas (${totalOtras})`}
    </button>
    ${vista.verPasadas ? listaHTML() : ""}`;

  main.innerHTML = `
    <div class="cal anim-entra">
      <div class="cal-cab">
        <button id="cal-prev" aria-label="Mes anterior">${ICONO.chevIzq}</button>
        <b id="cal-titulo">${MESES[vista.calMes]} ${vista.calAnio}</b>
        <button id="cal-next" aria-label="Mes siguiente">${ICONO.chevDer}</button>
      </div>
      <div class="cal-grid">${DOW.map(x => `<div class="dow">${x}</div>`).join("")}${celdas.map(c => c ? `
        <div class="cal-dia ${c.esHoy ? "hoy" : ""} ${c.ds === vista.diaSel ? "sel" : ""} ${(porFecha[c.ds] || []).length ? "tiene" : ""}" data-ds="${c.ds}" role="button" tabindex="0" aria-label="${c.dia} de ${MESES[vista.calMes]}, ${(porFecha[c.ds] || []).length} entregas">${c.dia}${(porFecha[c.ds] || []).length ? `<div class="dots">${porFecha[c.ds].map(o => `<i style="background:var(--c-${estadoDe(o).c})"></i>`).join("")}</div>` : ""}</div>` : `<div></div>`).join("")}</div>
      <p style="font-size:11px;color:var(--mut);text-align:center;margin-top:8px">Tocá un día para ver sus entregas</p>
    </div>
    ${vista.diaSel ? `
      <div class="sect-titulo">${ICONO.cal} ${fdate(vista.diaSel)}</div>
      ${filaDia(vista.diaSel) || `<p style="font-size:13px;color:var(--mut);padding:4px 2px">Nada agendado este día.</p>`}` : ""}
    ${hayHoy ? plegableHTML : listaHTML()}
    ${vista.diaSel ? `<button class="addp" id="add-order-day" style="margin:10px 0 8px">Nuevo pedido con entrega este día</button>` : ""}`;

  qs("#cal-prev").onclick = () => { const r = sumarMes(vista.calAnio, vista.calMes, -1); vista.calAnio = r.anio; vista.calMes = r.mes; emitirVista(); };
  qs("#cal-next").onclick = () => { const r = sumarMes(vista.calAnio, vista.calMes, 1); vista.calAnio = r.anio; vista.calMes = r.mes; emitirVista(); };
  qsa(".cal-dia[data-ds]", main).forEach(el => {
    el.onclick = () => { vista.diaSel = vista.diaSel === el.dataset.ds ? null : el.dataset.ds; vista.verPasadas = false; emitirVista(); };
    el.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); } };
  });
  if (qs("#fold-otras")) qs("#fold-otras").onclick = () => { vista.verPasadas = !vista.verPasadas; emitirVista(); };
  if (qs("#add-order-day")) qs("#add-order-day").onclick = () => abrirEditorPedido(null, null, vista.diaSel);

  main.querySelectorAll(".card[data-pedido]").forEach(c => {
    c.onclick = () => abrirDetalle(c.dataset.pedido);
    c.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirDetalle(c.dataset.pedido); } };
  });
}
