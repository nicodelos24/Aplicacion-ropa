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
import { plantilla } from "../ui/plantilla.js";

/* fracción "pagadas/total" para la barra de cuotas (en 8avos, sin estilo inline) */
function fraccion(pagadas, cuotas, pasos = 24) {
  const p = Math.max(0, Math.min(1, pagadas / cuotas));
  const n = Math.round(p * pasos);
  return n === 0 ? "" : `${n}/24`;
}

export function abrirDetallePedido(id) {
  const d = db();
  const o = pedidoPorId(id);
  if (!o) return;
  const st = ESTADOS[o.estado] || ESTADOS.new;
  const items = o.items || [];
  const hero = items.find(i => i.foto || i.photo);

  const dcards = items.map(i => {
    const foto = i.foto ?? i.photo;
    return plantilla(DCARD, {
      ph: esc(foto ?? ""),
      thumb: foto ? `<img class="dthumb" src="${esc(foto)}" alt="">` : `<div class="dthumb">${svgCategoria(i.categoria)}</div>`,
      precio: fmt(precioItem(i) * qtyDe(i)),
      nombre: esc(nombreItem(i)) || "Producto",
      qty: qtyDe(i) > 1 ? `${qtyDe(i)} × ${fmt(precioItem(i))} la unidad` : "Precio unitario",
      label: esc(nombreItem(i)) || "producto",
    });
  }).join("");

  const estados = ORDEN_ESTADOS.map(k =>
    `<button class="b b-${ESTADOS[k].c} ${k === o.estado ? "on" : ""}" data-st="${k}" aria-pressed="${k === o.estado}">${ESTADOS[k].l}</button>`
  ).join("");

  const pagadas = cuotasPagadasDe(o);
  const cuotas = cuotasDe(o);

  abrirHoja(plantilla(HOJA, {
    stack: stackHTML(o),
    cliente: esc(o.cliente) || "Cliente",
    estados,
    fecha: o.fecha ? `<span class="det-fecha">${ICONO.cal} ${fdateShort(o.fecha)}</span>` : "",
    dcards,
    ayuda: (items.length > 1 || hero)
      ? `<p class="ayuda ayuda-izq">Tocá una tarjeta para traerla al frente${hero ? " · otro toque amplía su foto" : ""}</p>` : "",
    total: fmt(total(o)),
    cuotasHtml: o.estado === "due" ? plantilla(BLOQUE_CUOTAS, {
      r: fraccion(pagadas, cuotas),
      pagadas,
      cuotas,
    }) : "",
    wa: o.tel ? `<button class="btn btn-wa" id="waBtn">${ICONO.wa} Escribir por WhatsApp</button>` : "",
    icPencil: ICONO.pencil, icTrash: ICONO.trash, icX: ICONO.x,
  }));

  const dstack = qs("#dstack");
  if (dstack) {
    const relayout = () => {
      const cs = [...dstack.querySelectorAll(".dcard")];
      const off = cs.length > 1 ? Math.min(110, Math.max(60, (dstack.clientWidth - 240) / (cs.length - 1))) : 0;
      cs.forEach((c, i) => {
        /* la seleccionada se eleva apenas (6px) sobre el resto del abanico */
        const y = c.classList.contains("sel") ? -6 : 0;
        c.style.transform = `translate(${i * off}px, ${y}px)`;
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
  qs("#dCerrar").onclick = cerrarHoja;
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
    /* premio: al pasar a Pagado, celebración breve en vez de un simple toast */
    if (r.pedido.estado === "paid") { cerrarHoja(); celebrar("¡Pedido pagado!"); }
    else { abrirDetallePedido(id); toast(`Estado: ${nk.l}`); }
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

/** Momento premiante: anillos + check dibujado + mensaje. Respeta prefers-reduced-motion. */
export function celebrar(mensaje) {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const d = document.createElement("div");
  d.className = "celebra";
  d.setAttribute("role", "status");
  d.innerHTML = plantilla(CELEBRA, { mensaje: esc(mensaje), check: ICONO.checkSolo });
  document.body.appendChild(d);
  const fuera = () => { d.classList.add("saliendo"); setTimeout(() => d.remove(), 240); };
  d.addEventListener("click", fuera);
  setTimeout(fuera, quieto ? 400 : 1250);
}

const HOJA = `
  <div class="detail">
    <div class="agarre"></div>
    <div class="dclose">
      <button class="btn-mini" id="hEdit" aria-label="Editar pedido">{{icPencil}}</button>
      <button class="btn-mini danger" id="hDel" aria-label="Eliminar pedido">{{icTrash}}</button>
      <button class="btn-mini" id="hClose" aria-label="Cerrar detalle">{{icX}}</button>
    </div>
    {{stack}}
    <h2 class="contenedor-texto">{{cliente}}</h2>
    <div class="det-est">
      <div class="strow">{{estados}}</div>
      {{fecha}}
    </div>
    <div class="dcards" id="dstack">{{dcards}}</div>
    {{ayuda}}
    <div class="totalbar"><span>Total</span><b class="monto">{{total}}</b></div>
    {{cuotasHtml}}
    {{wa}}
    <button class="btn btn-ghost" id="dCerrar">Cerrar</button>
  </div>`;

const DCARD = `
    <div class="dcard" role="button" tabindex="0" aria-pressed="false" aria-label="Seleccionar {{label}}" data-ph="{{ph}}">
      {{thumb}}
      <div class="dcard-txt">
        <div class="dprecio monto">{{precio}}</div>
        <div class="dnombre contenedor-texto">{{nombre}}</div>
        <div class="dqty">{{qty}}</div>
      </div>
    </div>`;

const BLOQUE_CUOTAS = `
      <div class="barra-cuotas barra-det" data-r="{{r}}"><div class="relleno"></div></div>
      <div class="cuotas-ctrl">
        <button class="btn cqbtn" id="cq-minus" aria-label="Quitar una cuota pagada">− Cuota</button>
        <div class="cuotas-mid">Pagó <b>{{pagadas}} de {{cuotas}}</b></div>
        <button class="btn cqbtn" id="cq-plus" aria-label="Agregar una cuota pagada">+ Cuota</button>
      </div>`;

const CELEBRA = `
  <div class="celebra-in">
    <div class="check-premiado"><div class="anillo"></div><div class="anillo b"></div><div class="disco">{{check}}</div></div>
    <p>{{mensaje}}</p>
  </div>`;
