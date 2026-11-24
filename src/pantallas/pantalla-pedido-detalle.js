// pantalla-pedido-detalle.js — detalle: stack seleccionable + lightbox, cambio de estado con confirmación,
// artículo al frente: el segundo toque amplía su foto y desde el visor se abre
// «Editar este artículo» (único lugar para editar un artículo), que guarda el cambio en el pedido,
// cuotas con +/− que solo se guardan al confirmar («Guardar cuotas»), WhatsApp directo; momento
// premiante al completar cuotas. Cerrar con cambios de cuota sin guardar avisa antes de perderlos.
import { esc, qs, qsa } from "../ui/dom.js";
import { ICONO, svgCategoria } from "../ui/iconos.js";
import { fmt, fdateShort } from "../nucleo/index.js";
import {
  ESTADOS, ORDEN_ESTADOS, total, cuotasDe, cuotasPagadasDe, cuotasPagadasValidas, nombreItem, subtotalItem,
} from "../nucleo/pedidos.js";
import { setEstadoPedido, cuotaPedido, pedidoPorId, db, eliminarPedido } from "../estado/store.js";
import { abrirHoja, cerrarHoja, intentarCerrarHoja, alCerrarHoja } from "../ui/componentes/hoja.js";
import { toast } from "../ui/componentes/toast.js";
import { confirmar } from "../ui/componentes/confirmar.js";
import { abrirLightbox } from "../ui/componentes/lightbox.js";
import { stackHTML } from "../ui/componentes/stack.js";
import { abrirWhatsApp } from "../servicios/whatsapp.js";
import { abrirEditorPedido } from "./pantalla-pedido-editor.js";
import { abrirEditorArticulo } from "./pantalla-pedido-item-editor.js";
import { plantilla } from "../ui/plantilla.js";
import { ayudaHTML, cablearAyudas } from "../ui/componentes/ayuda.js";

/* fracción "pagadas/total" para la barra de cuotas (en 8avos, sin estilo inline) */
function fraccion(pagadas, cuotas, pasos = 24) {
  const p = Math.max(0, Math.min(1, pagadas / cuotas));
  const n = Math.round(p * pasos);
  return n === 0 ? "" : `${n}/24`;
}

/* Visor sin foto: un SVG autocontenido con el avatar de la categoría, para que
   el doble toque SIEMPRE abra el visor y desde ahí se pueda editar el artículo
   (incluso los productos que no tienen foto). */
function avatarDataURL(item) {
  const letra = ((nombreItem(item) || "?").trim().charAt(0).toUpperCase() || "?")
    .replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c]));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><rect width="240" height="240" fill="#eef0f4"/><text x="120" y="120" font-family="sans-serif" font-size="120" font-weight="700" fill="#64748b" text-anchor="middle" dominant-baseline="central">${letra}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function abrirDetallePedido(id) {
  const d = db();
  const o = pedidoPorId(id);
  if (!o) return;
  const st = ESTADOS[o.estado] || ESTADOS.new;
  const items = o.items || [];
  const hero = items.find(i => i.foto || i.photo);

  const dcards = items.map((i, indice) => {
    const foto = i.foto ?? i.photo;
    return plantilla(DCARD, {
      ph: esc(foto ?? ""),
      thumb: foto ? `<img class="dthumb" src="${esc(foto)}" alt="">` : `<span class="dthumb" aria-hidden="true">${svgCategoria(i.categoria)}</span>`,
      precio: fmt(subtotalItem(i)),
      nombre: esc(nombreItem(i)) || "Producto",
      label: `${esc(nombreItem(i)) || "producto"}, ${esc(fmt(subtotalItem(i)))}`,
      seleccionada: indice === Math.floor(items.length / 2) ? "true" : "false",
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
    total: fmt(total(o)),
    cuotasHtml: o.estado === "due" ? plantilla(BLOQUE_CUOTAS, {
      r: fraccion(pagadas, cuotas),
      pagadas,
      cuotas,
    }) : "",
    wa: o.tel ? `<button class="btn btn-wa" id="waBtn">${ICONO.wa} Escribir por WhatsApp</button>` : "",
    icPencil: ICONO.pencil, icTrash: ICONO.trash, icX: ICONO.x,
  }));

  cablearAyudas(qs("#hoja-in") || document);
  const dstack = qs("#dstack");
  const cartas = qsa(".dcard", dstack);
  const huecos = cartas.length - 1;
  let activa = cartas.length ? Math.floor(cartas.length / 2) : -1;
  const actualizarFrente = () => {
    cartas.forEach((carta, i) => {
      carta.style.setProperty("--nivel", carta === cartas[activa] ? cartas.length + 1 : cartas.length - Math.abs(i - activa));
      carta.classList.toggle("dcard-frente", i === activa);
    });
  };
  actualizarFrente();
  /* foto ampliada: el visor conocido, con la acción que abre la edición del
     artículo. Es el ÚNICO lugar para editar un artículo (a doble toque). */
  const ampliar = (i) => {
    if (!items[i]) return;
    const foto = items[i].foto ?? items[i].photo ?? avatarDataURL(items[i]);
    abrirLightbox(foto, {
      acciones: [{
        label: "Editar este artículo", icono: ICONO.pencil,
        alTocar: () => abrirEditorArticulo(id, i),
      }],
    });
  };
  dstack.style.setProperty("--huecos", Math.max(1, huecos));
  cartas.forEach((c, i) => {
    const lado = i - huecos / 2;
    c.style.setProperty("--lado", lado);
    c.style.setProperty("--giro", `${huecos > 0 ? 8 * lado / huecos : 0}deg`);
    c.onclick = () => {
      c.focus({ preventScroll: true });
      /* segundo toque sobre la tarjeta que está al frente: amplía su foto */
      if (activa === i) { ampliar(i); return; }
      cartas[activa]?.setAttribute("aria-pressed", "false");
      activa = i;
      c.setAttribute("aria-pressed", "true");
      actualizarFrente();
    };
  });

  qs("#hClose").onclick = intentarCerrarHoja;
  qs("#dCerrar").onclick = intentarCerrarHoja;
  qs("#hEdit").onclick = () => abrirEditorPedido(o);
  qs("#hDel").onclick = async () => {
    if (!(await confirmar({ title: "¿Eliminar este pedido?", msg: `El pedido de ${o.cliente || "este cliente"} se quita de la lista. El inventario no cambia.`, ok: "Eliminar pedido" }))) return;
    eliminarPedido(id);
    cerrarHoja(); toast("Pedido eliminado");
  };

  qsa(".strow .b").forEach(b => b.onclick = async () => {
    if (b.dataset.st === o.estado) return;
    const nk = ESTADOS[b.dataset.st];
    const ok = b.dataset.st === "paid" ? "Marcar como pagado" : "Cambiar estado";
    if (!(await confirmar({ title: `¿Cambiar estado a “${nk.l}”?`, msg: `El pedido de ${o.cliente || "este cliente"} pasa de “${st.l}” a “${nk.l}”.`, ok, danger: false }))) return;
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

  /* Cuotas: +/− solo mueven un contador en memoria; nada se persiste hasta
     «Guardar cuotas». «Descartar» vuelve al valor guardado. */
  if (o.estado === "due" && qs("#cq-plus")) {
    const barra = qs(".barra-det");
    const mid = qs(".cuotas-mid");
    const acciones = qs("#cuotas-acciones");
    let guardadas = pagadas;
    let cuenta = pagadas;

    const pintar = () => {
      const sucio = cuenta !== guardadas;
      barra.dataset.r = fraccion(cuenta, cuotas);
      mid.innerHTML = `Pagó <b>${cuenta} de ${cuotas}</b>` + (sucio ? ` <span class="cuotas-pend">sin guardar</span>` : "");
      acciones.classList.toggle("oculto", !sucio);
      qs(".cuotas-ctrl").classList.toggle("sin-guardar", sucio);
      /* el aviso al cerrar solo existe mientras haya algo que perder */
      alCerrarHoja(sucio ? async () => {
        const salir = await confirmar({
          title: "¿Salir sin guardar las cuotas?",
          msg: `Cambiaste las cuotas de ${o.cliente || "este cliente"} a ${cuenta} de ${cuotas} y no las guardaste.`,
          ok: "Salir sin guardar",
        });
        return !!salir;
      } : null);
    };

    const mover = delta => { cuenta = cuotasPagadasValidas(cuenta + delta, cuotas); pintar(); };
    qs("#cq-plus").onclick = () => mover(1);
    qs("#cq-minus").onclick = () => mover(-1);
    qs("#cq-descartar").onclick = () => { cuenta = guardadas; pintar(); };
    qs("#cq-guardar").onclick = () => {
      const delta = cuenta - guardadas;
      if (delta === 0) { pintar(); return; }
      const r = cuotaPedido(id, delta);
      if (!r.ok) { toast("No se pudieron guardar las cuotas", "err"); return; }
      if (r.pedido.estado === "paid") { cerrarHoja(); celebrar("¡Pedido pagado por completo!"); }
      else { abrirDetallePedido(id); toast(`Cuotas guardadas: ${cuenta} de ${cuotas}`); }
    };
    pintar();
  }
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
    <div class="dcards-pie">
      ${ayudaHTML("Tocá una tarjeta para traerla al frente; tocá dos veces para ampliar el artículo y desde el visor podés editarlo.", "Cómo usar las tarjetas")}
    </div>
    <div class="totalbar"><span>Total</span><b class="monto">{{total}}</b></div>
    {{cuotasHtml}}
    {{wa}}
    <button class="btn btn-ghost" id="dCerrar">Cerrar</button>
  </div>`;

const DCARD = `
    <button type="button" class="dcard" aria-pressed="{{seleccionada}}" aria-label="Seleccionar {{label}}" data-ph="{{ph}}">
      {{thumb}}
      <span class="dcard-txt">
        <span class="dprecio monto">{{precio}}</span>
        <span class="dnombre contenedor-texto">{{nombre}}</span>
      </span>
    </button>`;

const BLOQUE_CUOTAS = `
      <div class="barra-cuotas barra-det" data-r="{{r}}"><div class="relleno"></div></div>
      <div class="cuotas-ctrl">
        <button class="btn cqbtn" id="cq-minus" aria-label="Quitar una cuota pagada">− Cuota</button>
        <div class="cuotas-mid">Pagó <b>{{pagadas}} de {{cuotas}}</b></div>
        <button class="btn cqbtn" id="cq-plus" aria-label="Agregar una cuota pagada">+ Cuota</button>
      </div>
      <div class="cuotas-acciones oculto" id="cuotas-acciones">
        <button class="btn btn-primario" id="cq-guardar">Guardar cuotas</button>
        <button class="btn btn-ghost" id="cq-descartar">Descartar</button>
      </div>`;

const CELEBRA = `
  <div class="celebra-in">
    <div class="check-premiado"><div class="anillo"></div><div class="anillo b"></div><div class="disco">{{check}}</div></div>
    <p>{{mensaje}}</p>
  </div>`;
