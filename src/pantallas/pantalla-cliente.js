// pantalla-cliente.js — hoja de detalle: pendientes, hechos y "+ nuevo pedido para…".
import { esc, qs, qsa } from "../ui/dom.js";
import { ICONO } from "../ui/iconos.js";
import { fmt, fdateShort } from "../nucleo/nucleo.js";
import { fmtTel, resumenCliente } from "../nucleo/contacto.js";
import { estadoDe, total, nombreItem } from "../nucleo/pedidos.js";
import { db, clientes, pedidos, eliminarCliente } from "../estado/store.js";
import { abrirHoja, cerrarHoja } from "../ui/componentes/hoja.js";
import { abrirWhatsApp } from "../servicios/whatsapp.js";
import { abrirEditorCliente } from "./pantalla-cliente-editor.js";
import { abrirEditorPedido } from "./pantalla-pedido-editor.js";
import { abrirDetallePedido } from "./pantalla-pedido-detalle.js";
import { toast } from "../ui/componentes/toast.js";

const TONOS = { new: "yellow", msg: "orange", due: "blue", paid: "green" };

export function abrirHojaCliente(id) {
  const d = db();
  const c = clientes().find(x => x.id === id);
  if (!c) return;
  const r = resumenCliente(pedidos(), id);
  const pendientes = r.pedidos.filter(o => o.estado !== "paid");
  const hechos = r.pedidos.filter(o => o.estado === "paid");

  const filaPedido = o => `
    <div class="card borde-${TONOS[o.estado] || "yellow"}" data-pedido="${o.id}" role="button" tabindex="0">
      <div class="card-fila"><h3 class="card-titulo" style="font-size:14px;overflow-wrap:anywhere">${esc((o.items || []).map(nombreItem).join(", ")) || "Pedido"}</h3><span class="card-monto monto" style="font-size:14px">${fmt(total(o))}</span></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
        <span class="b b-${TONOS[o.estado] || "yellow"}">${estadoDe(o).l}</span>
        ${o.fecha ? `<span style="font-size:11px;color:var(--mut)">📅 ${fdateShort(o.fecha)}</span>` : ""}
      </div>
    </div>`;

  abrirHoja(`<div class="agarre"></div>
    <div style="display:flex;gap:12px;align-items:center;margin:10px 0 4px">
      <div class="avatar" style="width:52px;height:52px;font-size:20px">${esc((c.name || "?")[0].toUpperCase())}</div>
      <div style="min-width:0"><h2 class="contenedor-texto">${esc(c.name)}</h2><p style="font-size:13px;color:var(--mut)">${c.tel ? esc(fmtTel(c.tel, d.prefijo)) : "Sin teléfono"}</p></div>
    </div>
    <button class="btn btn-ghost" id="cli-edit" style="margin-top:12px">${ICONO.pencil} Editar datos del cliente</button>
    ${c.tel ? `<button class="btn btn-primario" id="cli-wa" style="margin-top:10px">${ICONO.wa} Escribir por WhatsApp</button>` : ""}
    ${c.notas ? `<p style="font-size:13px;color:var(--mut);margin:10px 2px 0">📝 ${esc(c.notas)}</p>` : ""}
    <div class="sect-titulo">Pendientes (${pendientes.length})</div>
    ${pendientes.length ? pendientes.map(filaPedido).join("") : `<p style="font-size:13px;color:var(--mut)">Nada pendiente de cobro.</p>`}
    <div class="sect-titulo">Hechos (${hechos.length})</div>
    ${hechos.length ? hechos.map(o => `
      <div class="card borde-green" data-pedido="${o.id}" role="button" tabindex="0">
        <div class="card-fila"><h3 class="card-titulo" style="font-size:14px;overflow-wrap:anywhere">${esc((o.items || []).map(nombreItem).join(", ")) || "Pedido"}</h3><span class="card-monto monto" style="font-size:14px">${fmt(total(o))}</span></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px"><span class="b b-green">Pagado</span>${o.fecha ? `<span style="font-size:11px;color:var(--mut)">📅 ${fdateShort(o.fecha)}</span>` : ""}</div>
      </div>`).join("") : `<p style="font-size:13px;color:var(--mut)">Todavía no cerró ningún pedido.</p>`}
    <button class="btn btn-primario" id="cli-new-order">+ Nuevo pedido para ${esc((c.name || "").split(" ")[0])}</button>
    <button class="btn btn-ghost" id="cli-cerrar">Cerrar</button>`);

  qs("#cli-edit").onclick = () => abrirEditorCliente(c);
  if (qs("#cli-wa")) qs("#cli-wa").onclick = () => abrirWhatsApp(c.tel, "", d.prefijo);
  qs("#cli-new-order").onclick = () => abrirEditorPedido(null, c);
  qs("#cli-cerrar").onclick = cerrarHoja;
  qsa(".hoja-in .card[data-pedido]").forEach(el => {
    el.onclick = () => abrirDetallePedido(el.dataset.pedido);
    el.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirDetallePedido(el.dataset.pedido); } };
  });
}

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
