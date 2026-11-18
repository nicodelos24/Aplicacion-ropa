// pantalla-historial.js — log de movimientos con filtro por autor.
import { esc, qsa } from "../ui/dom.js";
import { entradasConMeta, filtrarPorAutor } from "../servicios/historial.js";
import { db } from "../estado/store.js";
import { vista, emitirVista } from "../estado/vista.js";
import { MESES } from "../nucleo/moneda.js";

export function pintarHistorial(main) {
  const d = db();
  const todos = entradasConMeta(d.log);
  const autores = [...new Set(todos.map(e => e.who))].filter(Boolean);
  const chips = [["all", "Todos"], ...autores.map(a => [a, a])];
  const lista = filtrarPorAutor(todos, vista.logFiltro).slice().reverse();

  main.innerHTML = `
    <div class="chips" style="margin:2px 0 12px">${chips.map(([k, l]) =>
      `<button class="chip chip-neutral ${vista.logFiltro === k ? "on" : ""}" data-k="${esc(k)}" aria-pressed="${vista.logFiltro === k}">${esc(l)}</button>`).join("")}</div>
    ${lista.length ? `<div class="stagger">${lista.map(e => {
      const dd = new Date(e.ts || 0);
      const ok = dd.getTime() > 0;
      const hh = ok ? String(dd.getHours()).padStart(2, "0") + ":" + String(dd.getMinutes()).padStart(2, "0") : "";
      const dtxt = ok ? (dd.getDate() === new Date().getDate() ? "Hoy" : dd.getDate() + " " + MESES[dd.getMonth()].slice(0, 3)) : "";
      return `<div class="ev">
        <div style="font-size:18px;width:26px;text-align:center">${e.meta.icono}</div>
        <div style="flex:1;min-width:0"><h4 style="font-size:14px">${e.meta.label}</h4><p class="contenedor-texto">${esc(e.detail || "")}</p></div>
        <div class="ev-fecha">${dtxt ? dtxt + "<br>" : ""}${hh}${hh ? " · " : ""}<b style="color:var(--acc-text)">${esc(e.who)}</b></div>
      </div>`;
    }).join("")}</div>`
    : `<div class="vacio anim-entra"><div class="viso">🕘</div><b>Sin movimientos todavía</b><p>Cada pedido, producto o cambio<br>quedará registrado aquí con su autor.</p></div>`}`;

  qsa(".chip", main).forEach(c => c.onclick = () => { vista.logFiltro = c.dataset.k; emitirVista(); });
}
