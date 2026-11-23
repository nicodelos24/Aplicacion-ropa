// pantalla-inicio.js — "Todo tu negocio en un vistazo".
// Jerarquía del rediseño: tarjeta primaria de dinero protagonista, dos medianas y tres compactas.
import { esc, qsa } from "../ui/dom.js";
import { ICONO } from "../ui/iconos.js";
import { fmt, estadoDe, MESES } from "../nucleo/index.js";
import { resumenGeneral } from "../nucleo/filtros.js";
import { DSEM, hoy, fdateShort } from "../nucleo/fechas.js";
import { db, pedidos } from "../estado/store.js";
import { irA } from "../estado/vista.js";
import { cardPedidoHTML, cablearCardsPedidos } from "../ui/componentes/stack.js";
import { plantilla, animarContadores } from "../ui/plantilla.js";

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
  /* Inicio usa el mismo resumen del núcleo que el resto de la app */
  const { pendiente: porCobrar, cobrado } = resumenGeneral(todos);
  const nCuotas = enCuotas.length;

  const bloqueAgenda = proximos.length ? `
    <div class="sect-titulo anim-entra">${ICONO.cal} Próximos en agenda</div>
    <div class="stagger">${proximos.slice(0, 4).map(({ o, ds }) => `
      <div class="ev" data-pedido="${o.id}" role="button" tabindex="0" >
        <div class="ev-ico t-${estadoDe(o).c}">${ICONO.clock}</div>
        <div class="ev-txt">
          <h4 class="contenedor-texto">${esc(o.cliente)}</h4>
          <p class="contenedor-texto">${esc(o.items?.[0] ? o.items[0].nombre : "Pedido")}</p>
        </div>
        <div class="ev-fecha">${ds === hoy() ? "Hoy" : fdateShort(ds)}</div>
      </div>`).join("")}</div>` : "";

  const bloquePendientes = pendientes.length ? `
    <div class="sect-titulo anim-entra">Pendientes de cobro</div>
    <div class="stagger grilla-cards">${pendientes.slice(0, 3).map(o => cardPedidoHTML(o)).join("")}
      <button class="hlink" data-go="pedidos">Ver todos los pedidos ${ICONO.chevDerChico}</button>
    </div>` : "";

  main.innerHTML = plantilla(PLANTILLA, {
    fecha: `${DSEM[t.getDay()]}, ${t.getDate()} de ${MESES[t.getMonth()]}`,
    nombre: esc((d.users.find(u => u.id === d.usuarioId) || {}).nombre?.split(" ")[0] || ""),
    nPedidos: todos.length,
    porCobrar: fmt(porCobrar),
    porCobrarNum: porCobrar,
    nPendientes: pendientes.length,
    sPend: pendientes.length !== 1 ? "s" : "",
    cuotasTxt: nCuotas ? ` · ${nCuotas} en cuota${nCuotas !== 1 ? "s" : ""}` : "",
    cobrado: fmt(cobrado),
    cobradoNum: cobrado,
    nCuotas,
    cuotaPalabra: nCuotas === 1 ? "cuota" : "cuotas",
    nDias: diasAgenda.length,
    nInv: d.inventory.length,
    nCli: d.clients.length,
    icCash: ICONO.cash, icCheck: ICONO.check, icClock: ICONO.clock, icCal: ICONO.cal,
    icTag: ICONO.tag, icPeople: ICONO.people, icChev: ICONO.chevDerChico,
    bloqueAgenda,
    bloquePendientes,
  });

  animarContadores(main);

  qsa("[data-go]", main).forEach(b => b.onclick = () =>
    irA(b.dataset.go, b.dataset.f ? { filtro: b.dataset.f } : {}));
  cablearCardsPedidos(main, abrirDetalle);
  qsa(".ev[data-pedido]", main).forEach(c => {
    c.onclick = () => abrirDetalle(c.dataset.pedido);
    c.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirDetalle(c.dataset.pedido); } };
  });
}

const PLANTILLA = `
  <div class="saludo anim-entra">
    <p class="eyebrow">{{fecha}}</p>
    <h1 class="saludo-tit">Hola, {{nombre}}</h1>
  </div>
  <button class="moneycard anim-entra" data-go="pedidos" aria-label="Por cobrar {{porCobrar}}: {{nPendientes}} pedidos">
    <span class="money-top">
      <span class="sq sq-cash">{{icCash}}</span>
      <span class="money-lbl">Por cobrar</span>
      <span class="money-go">{{icChev}}</span>
    </span>
    <b class="money-num monto" data-cuenta="{{porCobrarNum}}" data-final="{{porCobrar}}" data-formato="monto">{{porCobrar}}</b>
    <span class="money-sub">{{nPendientes}} pedido{{sPend}} por cerrar{{cuotasTxt}}</span>
  </button>
  <div class="duo stagger">
    <button class="midcard" data-go="pedidos" data-f="paid">
      <span class="sq sq-check">{{icCheck}}</span>
      <b class="midcard-num monto" data-cuenta="{{cobradoNum}}" data-final="{{cobrado}}" data-formato="monto">{{cobrado}}</b>
      <span class="midcard-lbl">Cobrado</span>
    </button>
    <button class="midcard" data-go="pedidos" data-f="due">
      <span class="sq sq-clock">{{icClock}}</span>
      <b class="midcard-num" data-cuenta="{{nCuotas}}" data-formato="n">{{nCuotas}}</b>
      <span class="midcard-lbl">En {{cuotaPalabra}}</span>
    </button>
  </div>
  <div class="tiles stagger">
    <button class="tile" data-go="agenda">
      <span class="sq sq-cal">{{icCal}}</span>
      <b>{{nDias}}</b><span class="tile-lbl">Agenda</span>
    </button>
    <button class="tile" data-go="inventario">
      <span class="sq sq-tag">{{icTag}}</span>
      <b>{{nInv}}</b><span class="tile-lbl">Productos</span>
    </button>
    <button class="tile" data-go="contactos">
      <span class="sq sq-people">{{icPeople}}</span>
      <b>{{nCli}}</b><span class="tile-lbl">Clientes</span>
    </button>
  </div>
  {{bloqueAgenda}}
  {{bloquePendientes}}
`;
