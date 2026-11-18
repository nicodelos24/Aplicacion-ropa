// pantalla-pedido-detalle.js — detalle: stack seleccionable + lightbox, cambio de estado con confirmación,
// cuotas con +/− y auto-paso a Pagado, WhatsApp directo; momento premiante al completar cuotas.
import { esc, qs, qsa } from "../ui/dom.js";
import { ICONO, svgCategoria } from "../ui/iconos.js";
import { fmt, fdateShort } from "../nucleo/nucleo.js";
import {
  ESTADOS, ORDEN_ESTADOS, total, cuotasDe, cuotasPagadasDe, cuotaStep, nombreItem, precioItem, qtyDe,
} from "../nucleo/pedidos.js";
import { setEstadoPedido, cuotaPedido, pedidoPorId, db, eliminarPedido } from "../estado/store.js";
import { abrirHoja, cerrarHoja } from "../ui/componentes/hoja.js";
import { toast } from "../ui/componentes/toast.js";
import { confirmar } from "../ui/componentes/confirmar.js";
import { abrirLightbox } from "../ui/componentes/lightbox.js";
import { stackHTML } from "../ui/componentes/stack.js";
import { abrirWhatsApp } from "../servicios/whatsapp.js";
import { abrirEditorPedido } from "./pantalla-pedido-editor.js";

export function abrirDetallePedido(id) {
  const d = db();
  const o = pedidoPorId(id);
  if (!o) return;
  const st = ESTADOS[o.estado] || ESTADOS.new;
  const items = o.items || [];
  const hero = items.find(i => i.foto || i.photo);
  const dcards = items.map(i => `
    <div class="dcard" role="button" tabindex="0" aria-pressed="false" aria-label="Seleccionar ${esc(nombreItem(i)) || "producto"}" data-ph="${esc(i.foto ?? i.photo ?? "")}">
      ${i.foto || i.photo ? `<img class="dthumb" src="${esc(i.foto ?? i.photo)}" alt="">` : `<div class="dthumb">${svgCategoria(i.categoria)}</div>`}
      <div style="min-width:0">
        <div class="dprecio monto">${fmt(precioItem(i) * qtyDe(i))}</div>
        <div class="dnombre contenedor-texto">${esc(nombreItem(i)) || "Producto"}</div>
        <div class="dqty">${qtyDe(i) > 1 ? `${qtyDe(i)} × ${fmt(precioItem(i))} la unidad` : "Precio unitario"}</div>
      </div>
    </div>`).join("");

  abrirHoja(`<div class="detail">
    <div class="agarre"></div>
    <div class="dclose" style="display:flex;gap:8px;justify-content:flex-end">
      <button class="btn-mini" id="hEdit" aria-label="Editar pedido">${ICONO.pencil}</button>
      <button class="btn-mini danger" id="hDel" aria-label="Eliminar pedido">${ICONO.trash}</button>
      <button class="btn-mini" id="hClose" aria-label="Cerrar detalle">${ICONO.x}</button>
    </div>
    ${stackHTML(o)}
    <h2 class="contenedor-texto">${esc(o.cliente) || "Cliente"}</h2>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;align-items:center">
      <div class="strow" style="flex:1">
        ${ORDEN_ESTADOS.map(k => `<button class="b b-${ESTADOS[k].c} ${k === o.estado ? "on" : ""}" data-st="${k}" aria-pressed="${k === o.estado}">${ESTADOS[k].l}</button>`).join("")}
      </div>
      ${o.fecha ? `<span style="font-size:11px;color:var(--mut);display:inline-flex;align-items:center;gap:4px">${ICONO.cal} ${fdateShort(o.fecha)}</span>` : ""}
    </div>
    ${items.length ? `
      <div class="dcards" id="dstack" style="position:relative;margin-top:12px">${dcards}</div>
      ${(items.length > 1 || hero) ? `<p style="font-size:11px;color:var(--mut);margin:8px 2px 0">Tocá una tarjeta para traerla al frente${hero ? " · otro toque amplía su foto" : ""}</p>` : ""}`
      : `<p style="color:var(--mut);font-size:14px;margin-top:12px">Sin productos</p>`}
    <div class="totalbar"><span>Total</span><b class="monto">${fmt(total(o))}</b></div>
    ${o.estado === "due" ? `
      <div class="barra-cuotas" style="margin-top:12px;--p:${Math.min(1, cuotasPagadasDe(o) / cuotasDe(o))}"><div class="relleno"></div></div>
      <div class="cuotas-ctrl">
        <button class="btn cqbtn" id="cq-minus" aria-label="Quitar una cuota pagada">− Cuota</button>
        <div style="color:var(--mut);font-size:13px;text-align:center;line-height:1.35">Pagó <b style="display:block;white-space:nowrap;color:var(--txt);font-variant-numeric:tabular-nums">${cuotasPagadasDe(o)} de ${cuotasDe(o)}</b></div>
        <button class="btn cqbtn" id="cq-plus" aria-label="Agregar una cuota pagada">+ Cuota</button>
      </div>` : ""}
    ${o.tel ? `<button class="btn btn-primario" id="waBtn" style="background:color-mix(in srgb,var(--c-green) 16%,var(--card));color:var(--c-green-text);box-shadow:none;border:1.5px solid color-mix(in srgb,var(--c-green) 55%,var(--line))">${ICONO.wa} Escribir por WhatsApp</button>` : ""}
    <button class="btn btn-ghost" id="dCerrar">Cerrar</button>
  </div>`);

  const dstack = qs("#dstack");
  if (dstack) {
    const relayout = () => {
      const cs = [...dstack.querySelectorAll(".dcard")];
      const off = cs.length > 1 ? Math.min(110, Math.max(60, (dstack.clientWidth - 240) / (cs.length - 1))) : 0;
      cs.forEach((c, i) => {
        c.style.transform = `translateX(${i * off}px)`;
        c.style.width = Math.min(340, dstack.clientWidth - (cs.length - 1) * off) + "px";
        c.style.zIndex = c.classList.contains("sel") ? 120 : i + 2;
      });
      const h = cs.reduce((m, c) => Math.max(m, c.offsetTop + c.offsetHeight), 0);
      dstack.style.height = (h + 6) + "px";
    };
    relayout();
    let sel = null;
    qsa(".dcard", dstack).forEach(c => {
      c.onclick = () => {
        c.focus({ preventScroll: true });
        if (sel === c) { abrirLightbox(c.dataset.ph); return; }
        qsa(".dcard", dstack).forEach(x => { x.classList.remove("sel"); x.setAttribute("aria-pressed", "false"); });
        c.classList.add("sel"); c.setAttribute("aria-pressed", "true"); sel = c; relayout();
      };
      c.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); c.click(); } };
    });
    setTimeout(relayout, 60);
  }

  qs("#hClose").onclick = cerrarHoja;
  qs("#hEdit").onclick = () => abrirEditorPedido(o);
  qs("#hDel").onclick = async () => {
    if (!(await confirmar({ title: "¿Eliminar este pedido?", msg: `El pedido de ${o.cliente || "este cliente"} se quita de la lista. El inventario no cambia.`, ok: "Eliminar pedido" }))) return;
    eliminarPedido(id);
    cerrarHoja(); toast("Pedido eliminado");
  };
  qsa(".strow .b").forEach(b => b.onclick = async () => {
    if (b.dataset.st === o.estado) return;
    const nk = ESTADOS[b.dataset.st];
    if (!(await confirmar({ title: `¿Cambiar estado a “${nk.l}”?`, msg: `El pedido de ${o.cliente || "este cliente"} pasa de “${st.l}” a “${nk.l}”.`, ok: "Cambiar estado", danger: false }))) return;
    const r = setEstadoPedido(id, b.dataset.st);
    if (!r.ok) { toast("No se pudo cambiar el estado", "err"); return; }
    if (r.pedido.estado === "paid") cerrarHoja();
    else abrirDetallePedido(id);
    toast(`Estado: ${nk.l}`);
  });
  const waBtn = qs("#waBtn");
  if (waBtn) waBtn.onclick = () => {
    const msg = `Hola ${o.cliente}! Te escribo por tu pedido: ${items.map(nombreItem).join(", ")}. Total ${fmt(total(o))}.`;
    abrirWhatsApp(o.tel, msg, d.prefijo);
  };
  const bump = delta => {
    const r = cuotaPedido(id, delta);
    if (!r.ok) return;
    if (r.pedido.estado === "paid") { cerrarHoja(); celebrar("¡Pedido pagado por completo!"); }
    else abrirDetallePedido(id);
  };
  if (qs("#cq-plus")) qs("#cq-plus").onclick = () => bump(1);
  if (qs("#cq-minus")) qs("#cq-minus").onclick = () => bump(-1);
}

/** Momento premiante: check animado + micro-celebración (sin exagerar). */
function celebrar(mensaje) {
  const d = document.createElement("div");
  d.style.cssText = "position:fixed;inset:0;z-index:600;display:grid;place-items:center;background:var(--overlay);opacity:1;transition:opacity .2s";
  d.innerHTML = `<div style="text-align:center">
    <div class="check-premiado"><div class="anillo"></div><div class="disco">${ICONO.checkSolo}</div></div>
    <p style="margin-top:12px;font-weight:700;color:var(--txt)">${esc(mensaje)}</p>
  </div>`;
  document.body.appendChild(d);
  setTimeout(() => { d.style.opacity = "0"; }, 900);
  setTimeout(() => d.remove(), 1150);
}
