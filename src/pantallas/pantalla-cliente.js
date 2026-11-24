// pantalla-cliente.js — hoja de detalle: pendientes, hechos y "+ nuevo pedido para…".
import { esc, qs, qsa } from "../ui/dom.js";
import { ICONO } from "../ui/iconos.js";
import { fmt, fdateShort } from "../nucleo/index.js";
import { fmtTel, resumenCliente } from "../nucleo/contacto.js";
import { estadoDe, total, nombreItem, tonoDe } from "../nucleo/pedidos.js";
import { db, clientes, pedidos, eliminarCliente } from "../estado/store.js";
import { abrirHoja, cerrarHoja } from "../ui/componentes/hoja.js";
import { abrirWhatsApp } from "../servicios/whatsapp.js";
import { abrirEditorCliente } from "./pantalla-cliente-editor.js";
import { abrirEditorPedido } from "./pantalla-pedido-editor.js";
import { abrirDetallePedido } from "./pantalla-pedido-detalle.js";
import { toast } from "../ui/componentes/toast.js";
import { plantilla } from "../ui/plantilla.js";

/* fila de pedido dentro de la hoja: título = productos, monto a la derecha, estado + fecha */
function filaPedido(o) {
  const tono = tonoDe(o);
  return plantilla(FILA, {
    id: o.id,
    tono,
    items: esc((o.items || []).map(nombreItem).join(", ")) || "Pedido",
    monto: fmt(total(o)),
    estado: estadoDe(o).l,
    fecha: o.fecha ? `<span class="fila-fecha">${ICONO.cal} ${fdateShort(o.fecha)}</span>` : "",
  });
}

const FILA = `
  <div class="card fila-pedido borde-{{tono}}" data-pedido="{{id}}" role="button" tabindex="0">
    <div class="card-fila">
      <h3 class="card-titulo contenedor-texto">{{items}}</h3>
      <span class="card-monto monto">{{monto}}</span>
    </div>
    <div class="card-chips"><span class="b b-{{tono}}">{{estado}}</span>{{fecha}}</div>
  </div>`;

export function abrirHojaCliente(id) {
  const d = db();
  const c = clientes().find(x => x.id === id);
  if (!c) return;
  const r = resumenCliente(pedidos(), id);
  const pendientes = r.pedidos.filter(o => o.estado !== "paid");
  const hechos = r.pedidos.filter(o => o.estado === "paid");

  abrirHoja(plantilla(HOJA, {
    avatar: c.foto
      ? `<img src="${esc(c.foto)}" alt="Foto de ${esc(c.name)}">`
      : esc((c.name || "?")[0].toUpperCase()),
    nombre: esc(c.name),
    tel: c.tel ? esc(fmtTel(c.tel, d.prefijo)) : "Sin teléfono",
    notas: c.notas ? plantilla(NOTA, { texto: esc(c.notas), icono: ICONO.nota }) : "",
    wa: c.tel
      ? `<button class="btn btn-wa" id="cli-wa">${ICONO.wa} Escribir por WhatsApp</button>` : "",
    nPend: pendientes.length,
    filaPend: pendientes.length
      ? pendientes.map(filaPedido).join("")
      : `<p class="nota-vacia">Nada pendiente de cobro.</p>`,
    nHechos: hechos.length,
    filaHechos: hechos.length
      ? hechos.map(filaPedido).join("")
      : `<p class="nota-vacia">Todavía no cerró ningún pedido.</p>`,
    primero: esc((c.name || "").split(" ")[0]),
    icPencil: ICONO.pencil,
  }));

  qs("#cli-edit").onclick = () => abrirEditorCliente(c);
  if (qs("#cli-wa")) qs("#cli-wa").onclick = () => abrirWhatsApp(c.tel, "", d.prefijo);
  qs("#cli-new-order").onclick = () => abrirEditorPedido(null, c);
  qs("#cli-cerrar").onclick = cerrarHoja;
  qsa(".hoja-in .card[data-pedido]").forEach(el => {
    el.onclick = () => abrirDetallePedido(el.dataset.pedido);
    el.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirDetallePedido(el.dataset.pedido); } };
  });
}

const HOJA = `
  <div class="agarre"></div>
  <div class="perfil">
    <div class="avatar avatar-gran">{{avatar}}</div>
    <div class="contenedor-texto">
      <h2 class="perfil-nombre">{{nombre}}</h2>
      <p class="perfil-tel">{{tel}}</p>
    </div>
  </div>
  <button class="btn btn-ghost" id="cli-edit">{{icPencil}} Editar datos del cliente</button>
  {{wa}}
  {{notas}}
  <div class="sect-titulo">Pendientes de pago ({{nPend}})</div>
  {{filaPend}}
  <div class="sect-titulo">Pagados ({{nHechos}})</div>
  {{filaHechos}}
  <button class="btn btn-primario" id="cli-new-order">Nuevo pedido para {{primero}}</button>
  <button class="btn btn-ghost" id="cli-cerrar">Cerrar</button>`;

const NOTA = `<p class="perfil-nota">{{icono}} <span class="contenedor-texto">{{texto}}</span></p>`;

/** Elimina cliente desde la hoja de edición (sus pedidos se conservan). */
export async function borrarCliente(c) {
  const r = await confirmarEliminar();
  if (r) {
    eliminarCliente(c.id);
    cerrarHoja(); toast("Cliente eliminado");
  }
}
import { confirmar } from "../ui/componentes/confirmar.js";
function confirmarEliminar() {
  return confirmar({ title: "¿Eliminar cliente?", msg: "Sus pedidos se conservan.", ok: "Eliminar cliente" });
}
