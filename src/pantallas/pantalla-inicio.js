// pantalla-inicio.js — "Todo tu negocio en un vistazo".
import { esc } from "../ui/dom.js";
import { ICONO } from "../ui/iconos.js";
import { fmt, totalLista, estadoDe, MESES } from "../nucleo/nucleo.js";
import { DSEM, hoy, fdateShort } from "../nucleo/fechas.js";
import { db, pedidos } from "../estado/store.js";
import { vista, irA } from "../estado/vista.js";
import { cardPedidoHTML, cablearCardsPedidos } from "../ui/componentes/stack.js";

export function pintarInicio(main, abrirDetalle) {
  const d = db();
  const todos = pedidos();
  const pagados = todos.filter(o => o.estado === "paid");
  const pendientes = todos.filter(o => o.estado !== "paid");
  const enCuotas = todos.filter(o => o.estado === "due");
  const diasAgenda = [...new Set(todos.filter(o => o.fecha).map(o => o.fecha))].filter(x => x >= hoy()).sort();

  const proximos = [];
  diasAgenda.slice(0, 5).forEach(ds => {
    todos.filter(o => o.fecha === ds).forEach(o => proximos.push({ o, ds }));
  });

  const t = new Date();
  main.innerHTML = `
    <div class="hi anim-entra">Hola, ${esc((d.users.find(u => u.id === d.usuarioId) || {}).nombre?.split(" ")[0] || "")}</div>
    <div class="hdate anim-entra" style="animation-delay:30ms">${DSEM[t.getDay()]}, ${t.getDate()} de ${MESES[t.getMonth()]}</div>
    <div class="hgrid stagger">
      <button class="hcard" data-go="pedidos"><span class="go">${ICONO.chevDerChico}</span><span class="ic ic-cash">${ICONO.cash}</span><b class="monto">${fmt(totalLista(pendientes))}</b><small>Por cobrar · ${pendientes.length} pedido${pendientes.length !== 1 ? "s" : ""}</small></button>
      <button class="hcard" data-go="pedidos" data-f="paid"><span class="go">${ICONO.chevDerChico}</span><span class="ic ic-check">${ICONO.check}</span><b class="monto">${fmt(totalLista(pagados))}</b><small>Cobrado · ${pagados.length} pedido${pagados.length !== 1 ? "s" : ""}</small></button>
      <button class="hcard" data-go="pedidos" data-f="due"><span class="go">${ICONO.chevDerChico}</span><span class="ic ic-clock">${ICONO.clock}</span><b>${enCuotas.length}</b><small>En ${enCuotas.length === 1 ? "cuota" : "cuotas"}</small></button>
      <button class="hcard" data-go="agenda"><span class="go">${ICONO.chevDerChico}</span><span class="ic ic-cal">${ICONO.cal}</span><b>${diasAgenda.length}</b><small>Día${diasAgenda.length !== 1 ? "s" : ""} con cosas en agenda</small></button>
      <button class="hcard" data-go="inventario"><span class="go">${ICONO.chevDerChico}</span><span class="ic ic-tag">${ICONO.tag}</span><b>${d.inventory.length}</b><small>Producto${d.inventory.length !== 1 ? "s" : ""} en inventario</small></button>
      <button class="hcard" data-go="contactos"><span class="go">${ICONO.chevDerChico}</span><span class="ic ic-people">${ICONO.people}</span><b>${d.clients.length}</b><small>Cliente${d.clients.length !== 1 ? "s" : ""}</small></button>
    </div>
    ${proximos.length ? `
      <div class="sect-titulo anim-entra" style="animation-delay:140ms">Próximos en agenda</div>
      <div class="stagger">${proximos.slice(0, 4).map(({ o, ds }) => `
        <div class="ev" data-pedido="${o.id}" role="button" tabindex="0">
          <div class="dot" style="background:var(--c-${estadoDe(o).c})"></div>
          <div style="flex:1;min-width:0"><h4 class="contenedor-texto">${esc(o.cliente)}</h4><p class="contenedor-texto">${esc(o.items?.[0] ? o.items[0].nombre : "Pedido")}</p></div>
          <div class="ev-fecha">${ds === hoy() ? "Hoy" : fdateShort(ds)}</div>
        </div>`).join("")}</div>` : ""}
    ${pendientes.length ? `
      <div class="sect-titulo anim-entra" style="animation-delay:160ms">Pendientes de cobro</div>
      <div class="stagger">${pendientes.slice(0, 3).map(o => cardPedidoHTML(o)).join("")}
      <button class="hlink" data-go="pedidos">Ver todos los pedidos</button></div>` : ""}`;

  main.querySelectorAll("[data-go]").forEach(b => b.onclick = () => irA(b.dataset.go, b.dataset.f ? { filtro: b.dataset.f } : {}));
  main.querySelectorAll(".ev[data-pedido]").forEach(c => {
    c.onclick = () => abrirDetalle(c.dataset.pedido);
    c.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirDetalle(c.dataset.pedido); } };
  });
}
