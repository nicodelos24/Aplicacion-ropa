// pantalla-agenda.js — agenda con dos vistas: calendario mensual (puntos por estado,
// día seleccionado, próximas y pasadas plegadas) y semana (franja LU…DO con pedidos
// agrupados por día). Ambas opciones conviven en el control Calendario ↔ Semanas.
import { esc, qs, qsa } from "../ui/dom.js";
import { ICONO } from "../ui/iconos.js";
import { celdasMes, sumarMes, fdate, fdateShort, hoy, lunesDe, sumarDias, diasSemana, DOW } from "../nucleo/fechas.js";
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

  const t = hoy();
  const modo = vista.agendaModo === "semanas" ? "semanas" : "calendario";

  /* Control compartido por ambas vistas: alterna sin perder el día elegido. */
  const alternadorHTML = () => `
    <div class="agenda-switch" role="group" aria-label="Vista de la agenda">
      <button class="agenda-switch-b ${modo === "calendario" ? "on" : ""}" data-modo="calendario"
        aria-pressed="${modo === "calendario"}">${ICONO.cal} Calendario</button>
      <button class="agenda-switch-b ${modo === "semanas" ? "on" : ""}" data-modo="semanas"
        aria-pressed="${modo === "semanas"}">${ICONO.lista} Semanas</button>
    </div>`;

  /* ---------------------- Vista Calendario (la de siempre) ---------------------- */
  const filaDia = (ds, conFecha) => (porFecha[ds] || []).map(o => cardPedidoHTML(o, { mostrarFecha: conFecha })).join("");

  const listaHTML = () => {
    const fechas = [...new Set(Object.keys(porFecha))].sort();
    const pasadas = fechas.filter(x => x < t).reverse();
    const futuras = fechas.filter(x => x >= t);
    const otrasF = vista.diaSel ? futuras.filter(x => x !== vista.diaSel) : futuras;
    const otrasP = vista.diaSel ? pasadas.filter(x => x !== vista.diaSel) : pasadas;
    return `
      <div class="sect-titulo">Próximas entregas</div>
      ${otrasF.length ? otrasF.map(ds => filaDia(ds, true)).join("") : `<p class="nota-vacia">Nada agendado a futuro.</p>`}
      ${otrasP.length ? `<div class="sect-titulo">Pasadas</div>${otrasP.map(ds => filaDia(ds, true)).join("")}` : ""}`;
  };

  const calendarioHTML = () => {
    const celdas = celdasMes(vista.calAnio, vista.calMes);
    const hayHoy = vista.diaSel && !!(porFecha[vista.diaSel] || []).length;
    const totalOtras = Object.keys(porFecha).filter(x => x !== vista.diaSel).length;
    const plegableHTML = `
      <button class="addp addp-tight" id="fold-otras">
        ${ICONO.chevAbajo} ${vista.verPasadas ? "Ocultar otras entregas" : `Ver otras entregas (${totalOtras})`}
      </button>
      ${vista.verPasadas ? listaHTML() : ""}`;

    return `
      <div class="cal anim-entra">
        <div class="cal-cab">
          <button id="cal-prev" aria-label="Mes anterior">${ICONO.chevIzq}</button>
          <b id="cal-titulo">${MESES[vista.calMes]} ${vista.calAnio}</b>
          <button id="cal-next" aria-label="Mes siguiente">${ICONO.chevDer}</button>
        </div>
        <div class="cal-grid">${DOW.map(x => `<div class="dow">${x}</div>`).join("")}${celdas.map(c => c ? `
          <div class="cal-dia ${c.esHoy ? "hoy" : ""} ${c.ds === vista.diaSel ? "sel" : ""} ${(porFecha[c.ds] || []).length ? "tiene" : ""}" data-ds="${c.ds}" role="button" tabindex="0" aria-label="${c.dia} de ${MESES[vista.calMes]}, ${(porFecha[c.ds] || []).length} entregas">${c.dia}${(porFecha[c.ds] || []).length ? `<div class="dots">${porFecha[c.ds].map(o => `<i class="d-${estadoDe(o).c}"></i>`).join("")}</div>` : ""}</div>` : `<div></div>`).join("")}</div>
        <p class="ayuda">Tocá un día para ver sus entregas</p>
      </div>
      ${vista.diaSel ? `
        <div class="sect-titulo">${ICONO.cal} ${fdate(vista.diaSel)}</div>
        ${filaDia(vista.diaSel) || `<p class="nota-vacia">Nada agendado este día.</p>`}` : ""}
      ${hayHoy ? plegableHTML : listaHTML()}
      ${vista.diaSel ? `<button class="addp addp-dia" id="add-order-day">Nuevo pedido con entrega este día</button>` : ""}`;
  };

  /* -------------------------- Vista Semanas (franja) -------------------------- */
  const semanaHTML = () => {
    /* Ancla:-el día elegido si está en esta semana; si no, el lunes de la semana que
       contiene hoy (o el mes visible). Así la franja siempre muestra datos reales. */
    const ancla = vista.diaSel || lunesDe(t);
    const dias = diasSemana(ancla);
    const lunes = dias[0].ds;
    const domingo = dias[6].ds;
    const sel = vista.diaSel && dias.some(x => x.ds === vista.diaSel) ? vista.diaSel : null;

    const franja = dias.map(x => {
      const n = (porFecha[x.ds] || []).length;
      return `<button class="sem-dia ${x.esHoy ? "hoy" : ""} ${x.ds === sel ? "sel" : ""}"
        data-ds="${x.ds}" aria-pressed="${x.ds === sel}"
        aria-label="${x.dow} ${x.dia} de ${MESES[x.mes]}, ${n} entregas">
        <span class="sem-dow">${x.dow}</span>
        <span class="sem-num">${x.dia}</span>
        ${n ? `<span class="sem-dots">${porFecha[x.ds].map(o => `<i class="d-${estadoDe(o).c}"></i>`).join("")}</span>` : `<span class="sem-dots"></span>`}
      </button>`;
    }).join("");

    /* Agrupación por día: se muestran los pedidos del día; sin hora de entrega en el
       modelo, se omite ese dato en vez de inventarlo. Cliente/producto/monto/estado
       salen de la card real reutilizada. */
    const diasConPedidos = dias.filter(x => (porFecha[x.ds] || []).length);
    const grouping = sel
      ? `<div class="sect-titulo">${ICONO.cal} ${fdate(sel)}</div>
         ${filaDia(sel) || `<p class="nota-vacia">Nada agendado este día.</p>`}`
      : diasConPedidos.length
        ? diasConPedidos.map(x => `
            <div class="sem-grupo">
              <div class="sem-grupo-titulo"><span class="sem-grupo-dia">${x.dow} ${x.dia} ${MESES[x.mes].slice(0, 3)}</span>
                <span class="sem-grupo-n">${porFecha[x.ds].length} ${porFecha[x.ds].length === 1 ? "pedido" : "pedidos"}</span></div>
              <div class="sem-grupo-eje">${filaDia(x.ds)}</div>
            </div>`).join("")
        : `<p class="nota-vacia">No hay entregas entre el ${fdateShort(lunes)} y el ${fdateShort(domingo)}.</p>`;

    return `
      <div class="semana anim-entra">
        <div class="sem-cab">
          <button id="sem-prev" aria-label="Semana anterior">${ICONO.chevIzq}</button>
          <b id="sem-titulo">${fdateShort(lunes)} – ${fdateShort(domingo)}</b>
          <button id="sem-next" aria-label="Semana siguiente">${ICONO.chevDer}</button>
        </div>
        <div class="sem-franja" role="group" aria-label="Días de la semana">${franja}</div>
        <p class="ayuda">Tocá un día para ver sus pedidos</p>
        ${grouping}
      </div>`;
  };

  main.innerHTML = `${alternadorHTML()}${modo === "semanas" ? semanaHTML() : calendarioHTML()}`;

  /* Cableado del alternador (compartido). */
  qsa(".agenda-switch-b", main).forEach(b => {
    b.onclick = () => { vista.agendaModo = b.dataset.modo; emitirVista(); };
  });

  if (modo === "calendario") {
    qs("#cal-prev").onclick = () => { const r = sumarMes(vista.calAnio, vista.calMes, -1); vista.calAnio = r.anio; vista.calMes = r.mes; emitirVista(); };
    qs("#cal-next").onclick = () => { const r = sumarMes(vista.calAnio, vista.calMes, 1); vista.calAnio = r.anio; vista.calMes = r.mes; emitirVista(); };
    qsa(".cal-dia[data-ds]", main).forEach(el => {
      el.onclick = () => { vista.diaSel = vista.diaSel === el.dataset.ds ? null : el.dataset.ds; vista.verPasadas = false; emitirVista(); };
      el.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); } };
    });
    if (qs("#fold-otras")) qs("#fold-otras").onclick = () => { vista.verPasadas = !vista.verPasadas; emitirVista(); };
    if (qs("#add-order-day")) qs("#add-order-day").onclick = () => abrirEditorPedido(null, null, vista.diaSel);
  } else {
    const ancla = vista.diaSel || lunesDe(t);
    qs("#sem-prev").onclick = () => { vista.diaSel = sumarDias(ancla, -7); emitirVista(); };
    qs("#sem-next").onclick = () => { vista.diaSel = sumarDias(ancla, 7); emitirVista(); };
    qsa(".sem-dia[data-ds]", main).forEach(el => {
      el.onclick = () => { vista.diaSel = vista.diaSel === el.dataset.ds ? null : el.dataset.ds; emitirVista(); };
    });
  }

  main.querySelectorAll(".card[data-pedido]").forEach(c => {
    c.onclick = () => abrirDetalle(c.dataset.pedido);
    c.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirDetalle(c.dataset.pedido); } };
  });
}
