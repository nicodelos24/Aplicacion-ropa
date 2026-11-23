// stack.js — stack de miniaturas de productos (foto o ícono SVG de categoría) y card resumen de pedido.
// Lee snapshots del ítem (v2: nombre/precio/foto) con compat v1 (name/price).
import { esc } from "../dom.js";
import { svgCategoria, ICONO } from "../iconos.js";
import { total, nombreItem, precioItem, qtyDe, tonoDe, estadoDe, cuotasDe, cuotasPagadasDe } from "../../nucleo/pedidos.js";
import { esFotoDemo } from "../../datos/fotos-demo.js";
import { fmt } from "../../nucleo/moneda.js";

export function miniaturaItem(item) {
  const foto = item.foto ?? item.photo;
  if (foto) return `<span class="mini ${esFotoDemo(foto) ? "mini-demo" : ""}" title="Foto de prueba · Demo"><img src="${esc(foto)}" alt=""></span>`;
  return `<span class="mini">${svgCategoria(item.categoria)}</span>`;
}

export function stackHTML(o, inventario = []) {
  const its = o.items || [];
  if (!its.length) return "";
  const vistos = its.slice(0, 4);
  return `<div class="stack">
    <div class="stack-mini">${vistos.map(miniaturaItem).join("")}${its.length > 4 ? `<span class="mini mas">+${its.length - 4}</span>` : ""}</div>
    <span class="stack-n">${its.reduce((s, i) => s + qtyDe(i), 0)}</span>
    <span class="stack-lbl">${its.length === 1 ? "producto" : its.length + " productos"}</span>  </div>`;
}

/** Card resumen de pedido reutilizable (Pedidos, Inicio, Contactos, Agenda). */
export function cardPedidoHTML(o, { mostrarFecha = false } = {}) {
  const tono = tonoDe(o);
  const cuotas = cuotasDe(o);
  const pagadas = cuotasPagadasDe(o);
  const chips = [
    `<span class="b b-${tono}">${estadoDe(o).l}</span>`,
    o.estado === "due" ? `<span class="b b-neutro monto">Pagó ${pagadas} de ${cuotas}</span>` : "",
    mostrarFecha && o.fecha ? `<span class="b b-neutro">${ICONO.cal}</span>` : "",
  ].join("");
  const pasos = 24;
  const nBarra = Math.round(Math.max(0, Math.min(1, pagadas / cuotas)) * pasos);
  const barra = o.estado === "due" && nBarra > 0
    ? `<div class="barra-cuotas" data-r="${nBarra}/${pasos}"><div class="relleno"></div></div>` : "";
  const items = esc((o.items || []).map(i => `${qtyDe(i) > 1 ? qtyDe(i) + "× " : ""}${nombreItem(i)}`).join(" · ")) || "Sin productos";
  const monto = fmt(total(o));
  return `<div class="card borde-${tono}" data-pedido="${o.id}" role="button" tabindex="0" aria-label="Pedido de ${esc(o.cliente) || "cliente"}, total ${monto}">
    ${stackHTML(o)}
    <div class="card-fila"><h3 class="card-titulo contenedor-texto">${esc(o.cliente) || "Sin nombre"}</h3><span class="card-monto monto">${monto}</span></div>
    <div class="card-sub contenedor-texto">${items}${o.fecha ? `<br>` : ""}${o.fecha ? `<span class="card-fecha">${ICONO.cal} <span class="monto">${esc(o.fecha)}</span></span>` : ""}</div>
    <div class="card-chips">${chips}</div>
    ${barra}</div>`;
}

/** Cablea apertura de detalle en todas las cards de pedido del contenedor. */
export function cablearCardsPedidos(root, abrirDetalle) {
  root.querySelectorAll(".card[data-pedido]").forEach(c => {
    c.onclick = () => abrirDetalle(c.dataset.pedido);
    c.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirDetalle(c.dataset.pedido); } };
  });
}
