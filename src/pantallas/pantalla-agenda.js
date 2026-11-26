// pantalla-agenda.js — agenda con dos vistas: calendario mensual (puntos por estado,
// día seleccionado, próximas y pasadas plegadas) y semana (franja LU…DO con pedidos
// agrupados por día). Ambas opciones conviven en el control Calendario ↔ Semanas.
//
// Animación (motion.css): los tres recambios que antes aparecían de golpe ahora
// entran con un keyframe corto que solo usa opacity/transform.
//   · switch Calendario ↔ Semanas → repintado completo con .agenda-anim[data-dir="vista"].
//   · flechas de mes y de semana → recambio EN EL SITIO (se reescribe la grilla o la
//     franja, no #main): así se anima justo lo que cambió y la página no salta.
//   · tocar una fecha sigue repintando como siempre (su transición es la del día).
import { esc, qs, qsa } from "../ui/dom.js";
import { ICONO } from "../ui/iconos.js";
import { celdasMes, sumarMes, fdate, fdateShort, hoy, lunesDe, sumarDias, diasSemana, DOW } from "../nucleo/fechas.js";
/* «1 entregas» se lee mal en el calendario y en la franja; el rótulo de los
   días con una sola entrega va en singular. */
const entregas = (n) => `${n} ${n === 1 ? "entrega" : "entregas"}`;
import { MESES } from "../nucleo/moneda.js";
import { estadoDe } from "../nucleo/pedidos.js";
import { pedidos } from "../estado/store.js";
import { vista, emitirVista } from "../estado/vista.js";
import { abrirDetallePedido } from "./pantalla-pedido-detalle.js";
import { abrirEditorPedido } from "./pantalla-pedido-editor.js";
import { cardPedidoHTML } from "../ui/componentes/stack.js";
import { pintarStats } from "./pantalla-pedidos.js";

/* Dirección del próximo recambio que necesita repintar #main entero (el switch
   de vista). Lo ponen los controles justo antes de emitirVista() y el pintado lo
   consume: así una entrada normal a la sección no se anima como si fuera un
   cambio pedido por la persona. */
let dirPendiente = null;

/* Reanima un nodo que se acaba de reescribir: quita la clase, fuerza el registro
   del reinicio y la vuelve a poner con la dirección pedida. Un solo reflow por
   toque (no por frame) y el movimiento queda en el compositor. */
function animar(el, dir) {
  if (!el) return;
  el.dataset.dir = dir;
  el.classList.remove("agenda-anim");
  void el.offsetWidth;
  el.classList.add("agenda-anim");
}

const tituloMes = (anio, mes) => `${MESES[mes]} ${anio}`;
const tituloSemana = dias => `${fdateShort(dias[0].ds)} – ${fdateShort(dias[6].ds)}`;

export function pintarAgenda(main, abrirDetalle) {
  const todos = pedidos();
  const porFecha = {};
  todos.forEach(o => { if (o.fecha) (porFecha[o.fecha] = porFecha[o.fecha] || []).push(o); });
  pintarStats([{ b: todos.filter(o => o.fecha).length, s: "Entregas agendadas" }]);

  const t = hoy();
  const modo = vista.agendaModo === "semanas" ? "semanas" : "calendario";

  /* Lo que quedó pintado en la vuelta anterior. Sirve para el switch: solo si ya
     había una agenda con otra vista se anima la entrada (la primera vez, no). */
  const anterior = main.dataset.agendaModo || null;

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

  /* Grilla del mes: es lo único que cambia al pasar de mes, así que se puede
     reescribir en el sitio y animar sin tocar el resto del almanaque. */
  const grillaCalHTML = () => {
    const celdas = celdasMes(vista.calAnio, vista.calMes);
    return `${DOW.map(x => `<div class="dow">${x}</div>`).join("")}${celdas.map(c => c ? `
      <div class="cal-dia ${c.esHoy ? "hoy" : ""} ${c.ds === vista.diaSel ? "sel" : ""} ${(porFecha[c.ds] || []).length ? "tiene" : ""}" data-ds="${c.ds}" role="button" tabindex="0" aria-label="${c.dia} de ${MESES[vista.calMes]}, ${entregas((porFecha[c.ds] || []).length)}">${c.dia}${(porFecha[c.ds] || []).length ? `<div class="dots">${porFecha[c.ds].map(o => `<i class="d-${estadoDe(o).c}"></i>`).join("")}</div>` : ""}</div>` : `<div></div>`).join("")}`;
  };

  const calendarioHTML = () => {
    const hayHoy = vista.diaSel && !!(porFecha[vista.diaSel] || []).length;
    const totalOtras = Object.keys(porFecha).filter(x => x !== vista.diaSel).length;
    /* El plegable mantiene SIEMPRE el mismo nodo (abierto o cerrado): el panel
       se despliega con una transición de altura real (grid 0fr→1fr), no
       apareciendo de golpe por un innerHTML. El botón solo alterna clases. */
    const plegableHTML = `
      <div class="fold-otras ${vista.verPasadas ? "abierto" : ""}">
        <button class="addp addp-tight" id="fold-otras" aria-expanded="${vista.verPasadas}">
          ${ICONO.chevAbajo} <span>${vista.verPasadas ? "Ocultar otras entregas" : `Ver otras entregas (${totalOtras})`}</span>
        </button>
        <div class="fold-panel"><div class="fold-inner">${listaHTML()}</div></div>
      </div>`;

    return `
      <div class="cal">
        <div class="cal-cab">
          <button id="cal-prev" aria-label="Mes anterior">${ICONO.chevIzq}</button>
          <b id="cal-titulo">${tituloMes(vista.calAnio, vista.calMes)}</b>
          <button id="cal-next" aria-label="Mes siguiente">${ICONO.chevDer}</button>
        </div>
        <div class="cal-grid">${grillaCalHTML()}</div>
        <p class="ayuda">Tocá un día para ver sus entregas</p>
      </div>
      ${vista.diaSel ? `
        <div class="agenda-dia">
          <div class="sect-titulo">${ICONO.cal} ${fdate(vista.diaSel)}</div>
          ${filaDia(vista.diaSel) || `<p class="nota-vacia">Nada agendado este día.</p>`}
        </div>` : ""}
      ${hayHoy ? plegableHTML : listaHTML()}
      ${vista.diaSel ? `<button class="addp addp-dia" id="add-order-day">Nuevo pedido con entrega este día</button>` : ""}`;
  };

  /* -------------------------- Vista Semanas (franja) -------------------------- */
  /* Ancla: el día elegido si está en esta semana; si no, el lunes de la semana que
     contiene hoy (o el mes visible). Así la franja siempre muestra datos reales. */
  const semana = () => {
    const ancla = vista.diaSel || lunesDe(t);
    const dias = diasSemana(ancla);
    const sel = vista.diaSel && dias.some(x => x.ds === vista.diaSel) ? vista.diaSel : null;
    return { dias, sel };
  };

  const franjaHTML = (dias, sel) => dias.map(x => {
    const n = (porFecha[x.ds] || []).length;
    return `<button class="sem-dia ${x.esHoy ? "hoy" : ""} ${x.ds === sel ? "sel" : ""} ${n ? "tiene" : ""}"
      data-ds="${x.ds}" aria-pressed="${x.ds === sel}"
      aria-label="${x.dow} ${x.dia} de ${MESES[x.mes]}, ${entregas(n)}">
      <span class="sem-dow">${x.dow}</span>
      <span class="sem-num">${x.dia}</span>
      ${n ? `<span class="sem-dots">${porFecha[x.ds].map(o => `<i class="d-${estadoDe(o).c}"></i>`).join("")}</span>` : `<span class="sem-dots"></span>`}
    </button>`;
  }).join("");

  /* Solo se muestran las tarjetas del día tocado en la franja, con su encabezado.
     Sin día elegido NO se despliegan las cards de toda la semana juntas: se invita
     a tocar un día. Así el resaltado de la franja y las cards siempre coinciden.
     Nota: sin hora de entrega en el modelo, se omite ese dato en vez de inventarlo;
     cliente/producto/monto/estado salen de la card real reutilizada. */
  const grupoInterior = sel => sel
    ? `<div class="sect-titulo">${ICONO.cal} ${fdate(sel)}</div>
       ${filaDia(sel) || `<p class="nota-vacia">Nada agendado este día.</p>`}`
    : `<p class="nota-vacia">Tocá un día de la franja para ver sus pedidos.</p>`;
  const grupoHTML = sel => `<div class="agenda-dia">${grupoInterior(sel)}</div>`;

  const semanaHTML = () => {
    const { dias, sel } = semana();
    return `
      <div class="semana">
        <div class="sem-cab">
          <button id="sem-prev" aria-label="Semana anterior">${ICONO.chevIzq}</button>
          <b id="sem-titulo">${tituloSemana(dias)}</b>
          <button id="sem-next" aria-label="Semana siguiente">${ICONO.chevDer}</button>
        </div>
        <div class="sem-franja" role="group" aria-label="Días de la semana">${franjaHTML(dias, sel)}</div>
        <p class="ayuda">Tocá un día para ver sus pedidos</p>
        ${grupoHTML(sel)}
      </div>`;
  };

  main.innerHTML = `${alternadorHTML()}${modo === "semanas" ? semanaHTML() : calendarioHTML()}`;
  main.dataset.agendaModo = modo;

  /* Cableado compartido de las tarjetas (se repite tras cada recambio en el sitio). */
  const cablearCards = () => {
    main.querySelectorAll(".card[data-pedido]").forEach(c => {
      c.onclick = () => abrirDetalle(c.dataset.pedido);
      c.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirDetalle(c.dataset.pedido); } };
    });
  };

  /* Cableado del alternador (compartido). Cambiar de vista repinta la sección
     entera: la entrada animada la aplica el final de este mismo pintado. */
  qsa(".agenda-switch-b", main).forEach(b => {
    b.onclick = () => {
      if (vista.agendaModo === b.dataset.modo) return;
      vista.agendaModo = b.dataset.modo;
      dirPendiente = "vista";
      emitirVista();
    };
  });

  const cablearDiasCal = () => qsa(".cal-dia[data-ds]", main).forEach(el => {
    el.onclick = () => { vista.diaSel = vista.diaSel === el.dataset.ds ? null : el.dataset.ds; vista.verPasadas = false; emitirVista(); };
    el.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); } };
  });

  const cablearDiasSem = () => qsa(".sem-dia[data-ds]", main).forEach(el => {
    el.onclick = () => { vista.diaSel = vista.diaSel === el.dataset.ds ? null : el.dataset.ds; emitirVista(); };
  });

  if (modo === "calendario") {
    /* Cambio de mes: se reescribe SOLO la grilla y el título, y la grilla entra
       desde el lado de la flecha tocada. Antes esto rehacía #main completo. */
    const pasarMes = delta => {
      const r = sumarMes(vista.calAnio, vista.calMes, delta);
      vista.calAnio = r.anio;
      vista.calMes = r.mes;
      const grid = qs(".cal-grid", main);
      if (!grid) { dirPendiente = delta > 0 ? "prox" : "prev"; emitirVista(); return; }
      grid.innerHTML = grillaCalHTML();
      animar(grid, delta > 0 ? "prox" : "prev");
      const titulo = qs("#cal-titulo", main);
      if (titulo) titulo.textContent = tituloMes(r.anio, r.mes);
      cablearDiasCal();
    };
    qs("#cal-prev").onclick = () => pasarMes(-1);
    qs("#cal-next").onclick = () => pasarMes(1);
    cablearDiasCal();
    /* Plegable «Ver otras entregas»: toggle local con la altura animada de
       motion.css (.fold-otras), sin repintar #main para que no se relance .vista. */
    const foldBtn = qs("#fold-otras");
    if (foldBtn) foldBtn.onclick = () => {
      vista.verPasadas = !vista.verPasadas;
      const wrap = foldBtn.closest(".fold-otras");
      if (wrap) wrap.classList.toggle("abierto", vista.verPasadas);
      foldBtn.setAttribute("aria-expanded", String(vista.verPasadas));
      const n = Object.keys(porFecha).filter(x => x !== vista.diaSel).length;
      const rotulo = foldBtn.querySelector("span");
      if (rotulo) rotulo.textContent = vista.verPasadas
        ? "Ocultar otras entregas" : `Ver otras entregas (${n})`;
    };
    if (qs("#add-order-day")) qs("#add-order-day").onclick = () => abrirEditorPedido(null, null, vista.diaSel);
  } else {
    /* Cambio de semana: mismo criterio, con la franja y el bloque del día. */
    const pasarSemana = delta => {
      const ancla = vista.diaSel || lunesDe(t);
      vista.diaSel = sumarDias(ancla, delta);
      const franja = qs(".sem-franja", main);
      if (!franja) { dirPendiente = delta > 0 ? "prox" : "prev"; emitirVista(); return; }
      const { dias, sel } = semana();
      franja.innerHTML = franjaHTML(dias, sel);
      animar(franja, delta > 0 ? "prox" : "prev");
      const titulo = qs("#sem-titulo", main);
      if (titulo) titulo.textContent = tituloSemana(dias);
      const grupo = qs(".agenda-dia", main);
      if (grupo) grupo.innerHTML = grupoInterior(sel);
      cablearDiasSem();
      cablearCards();
    };
    qs("#sem-prev").onclick = () => pasarSemana(-7);
    qs("#sem-next").onclick = () => pasarSemana(7);
    cablearDiasSem();
  }

  cablearCards();

  /* Entrada del cambio de vista: se anima la vista que acaba de aparecer, con un
     deslizo mínimo y un crossfade; #main conserva su .vista (no se relanza). */
  if (dirPendiente) {
    if (anterior && anterior !== modo) animar(modo === "calendario" ? qs(".cal", main) : qs(".semana", main), "vista");
    dirPendiente = null;
  }
}
