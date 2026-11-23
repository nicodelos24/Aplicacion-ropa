// pantalla-inventario.js — inventario con buscador, filtros y orden (decisión 1)
// sobre los cajones por sección (decisión B): chips de categoría con contador,
// selector de orden (más usados, A–Z, precio), vista alterna lista compacta con
// foto mini y precio, grilla 3× de siempre, editar/eliminar, lightbox y la hoja
// "Secciones". Los filtros son de pantalla: no cambian ningún dato.
import { esc, qsa } from "../ui/dom.js";
import { fmt } from "../nucleo/nucleo.js";
import { db, productos, pedidos, eliminarProducto, secciones } from "../estado/store.js";
import { vista, emitirVista } from "../estado/vista.js";
import { abrirLightbox } from "../ui/componentes/lightbox.js";
import { toast } from "../ui/componentes/toast.js";
import { confirmar } from "../ui/componentes/confirmar.js";
import { abrirEditorInventario } from "./pantalla-inventario-editor.js";
import { abrirHojaSecciones } from "./pantalla-inventario-secciones.js";
import { pintarStats } from "./pantalla-pedidos.js";
import { categoria } from "../nucleo/catalogo.js";
import { ICONO, VACIO_SVG, svgCategoria } from "../ui/iconos.js";
import { esFotoDemo } from "../datos/fotos-demo.js";
import { agruparPorSeccion } from "../nucleo/secciones.js";
import { normalizar } from "../nucleo/buscador.js";
import {
  ORDENES, ORDEN_DEFECTO, categoriaValida, filtrarInventario, ordenarInventario,
  usosPorProducto, categoriasConConteo, etiquetaOrden, hayFiltro,
} from "../nucleo/orden.js";

/* Cajones plegados por la clienta (solo estado de pantalla, no se guarda). */
const plegadas = new Set();

/** Foto o ícono de categoría cuadrado (grilla grande, fila mini). */
function thumbHTML(i, { mini = false } = {}) {
  if (i.photo) {
    return `<span class="${mini ? "fila-mini" : "inv-foto-wrap"}">${esFotoDemo(i.photo) ? `<span class="demo-marca-foto">DEMO</span>` : ""}<img class="${mini ? "fila-foto" : "inv-foto"}" src="${esc(i.photo)}" alt=""></span>`;
  }
  return `<span class="${mini ? "fila-mini fila-ph" : "inv-ph"}">${svgCategoria(i.cat)}</span>`;
}

function accionesHTML(i) {
  return `<span class="inv-acciones">
      <button class="e" data-act="edit" data-id="${i.id}" aria-label="Editar ${esc(i.name)}">${ICONO.pencil}</button>
      <button class="d" data-act="del" data-id="${i.id}" aria-label="Eliminar ${esc(i.name)}">${ICONO.trash}</button>
    </span>`;
}

function cardHTML(i) {
  return `<div class="inv-card" tabindex="0" role="button" aria-label="Ver foto de ${esc(i.name)}" data-id="${i.id}">
    ${thumbHTML(i)}
    <div class="inv-cuerpo"><h4>${esc(i.name)}</h4><p>${fmt(i.price)}${i.cat ? ` · ${esc(categoria(i.cat).label)}` : ""}</p></div>
    ${accionesHTML(i)}
  </div>`;
}

/** Fila compacta (vista alterna, variante 3): foto mini, nombre, sección y precio. */
function filaHTML(i, { seccionNombre, usos }) {
  const usada = usos.get(i.id) || 0;
  const detalle = [seccionNombre, usada === 1 ? "1 pedido" : usada > 1 ? `${usada} pedidos` : ""]
    .filter(Boolean).map(esc).join(" · ");
  return `<div class="inv-fila" tabindex="0" role="button" aria-label="Ver ${esc(i.name)}" data-id="${i.id}">
    ${thumbHTML(i, { mini: true })}
    <span class="fila-txt"><b>${esc(i.name)}</b>${detalle ? `<small>${detalle}</small>` : ""}</span>
    <span class="fila-precio monto">${fmt(i.price)}</span>
    ${accionesHTML(i)}
  </div>`;
}

/** Un cajón: cabecera-botón que pliega/despliega + grilla o lista. */
function cajonHTML(grupo, { conAcciones, modo = "grilla", usos = new Map() }) {
  const abierto = !plegadas.has(grupo.id ?? "__sin");
  const id = grupo.id || "sin";
  const n = grupo.productos.length;
  const cab = conAcciones
    ? `<span class="sec-mas" role="group" aria-label="Opciones de ${esc(grupo.nombre)}">
         <button class="sec-acc" data-sec-act="mover" data-sec="${esc(id)}" aria-label="Mover productos de ${esc(grupo.nombre)}">${ICONO.flecha}</button>
         <button class="sec-acc" data-sec-act="renombrar" data-sec="${esc(id)}" aria-label="Cambiar el nombre de ${esc(grupo.nombre)}">${ICONO.pencil}</button>
         <button class="sec-acc danger" data-sec-act="borrar" data-sec="${esc(id)}" aria-label="Eliminar la sección ${esc(grupo.nombre)}">${ICONO.trash}</button>
       </span>`
    : "";
  const cuerpo = modo === "lista"
    ? `<div class="inv-lista stagger">${grupo.productos.map(i => filaHTML(i, { seccionNombre: grupo.nombre, usos })).join("")}</div>`
    : `<div class="inv stagger">${grupo.productos.map(cardHTML).join("")}</div>`;
  return `<section class="sec${abierto ? "" : " plegada"}" data-sec-grupo="${esc(id)}">
    <div class="sec-cab">
      <button class="sec-toggle" data-sec-toggle="${esc(id)}" aria-expanded="${abierto}" aria-controls="sec-body-${esc(id)}">
        <span class="sec-nombre">${esc(grupo.nombre)}</span>
        <span class="sec-cnt">${n}</span>
        <span class="sec-caret">${ICONO.chevAbajo}</span>
      </button>
      ${cab}
    </div>
    <div class="sec-body" id="sec-body-${esc(id)}" ${abierto ? "" : "hidden"}>
      ${n
        ? cuerpo
        : `<p class="sec-vacia">Todavía no hay prendas acá. Editá una prenda y elegí esta sección.</p>`}
    </div>
  </section>`;
}

/** Barra del inventario: chips de categoría con contador y orden + vista. */
function barraHTML(inventario, visibles = inventario) {
  const cats = categoriasConConteo(inventario);
  const actual = categoriaValida(vista.invCategoria);
  const lista = vista.invVista === "lista";
  const chips = [{ id: "todas", label: "Todas", n: inventario.length }, ...cats]
    .map(c => `<button class="chip chip-cat${c.id === actual ? " on" : ""}" data-inv-cat="${c.id}" aria-pressed="${c.id === actual}">${esc(c.label)}<span class="n">${c.n}</span></button>`)
    .join("");
  const opciones = ORDENES.map(o => `<option value="${o.id}"${o.id === vista.invOrden ? " selected" : ""}>${esc(o.label)}</option>`).join("");
  return `<div class="inv-barra">
      <div class="chips chips-inv" id="inv-chips" role="group" aria-label="Filtrar por categoría">${chips}</div>
      <div class="invtools">
        <label class="invtools-orden">
          <span class="invtools-ico">${ICONO.ordenar}</span>
          <span class="sr-only">Ordenar por</span>
          <select id="inv-orden" aria-label="Ordenar por">${opciones}</select>
          <span class="invtools-caret">${ICONO.chevAbajo}</span>
        </label>
        <button class="invtools-vista" id="inv-vista" aria-pressed="${lista}"
          aria-label="${lista ? "Ver en grilla" : "Ver en lista"}" title="${lista ? "Ver en grilla" : "Ver en lista"}">
          ${lista ? ICONO.grilla : ICONO.filas}<span>${lista ? "Grilla" : "Lista"}</span>
        </button>
      </div>
      <div class="inv-resumen" id="inv-resumen">${esc(resumenTexto(visibles))}</div>
    </div>`;
}

function resumenTexto(visibles) {
  const cats = categoriaValida(vista.invCategoria);
  const nombre = cats === "todas" ? "" : (categoria(cats).label || "");
  const n = visibles.length;
  const cuenta = `${n} ${n === 1 ? "producto" : "productos"}`;
  const partes = [];
  if (vista.busqueda) partes.push(`Resultados para “${vista.busqueda}”`);
  if (nombre) partes.push(cuenta + " en " + nombre);
  if (!partes.length) partes.push(cuenta);
  return partes.join(" · ");
}

export function pintarInventario(main) {
  const d = db();
  const todas = secciones();
  const usos = usosPorProducto(pedidos());
  const modo = vista.invVista === "lista" ? "lista" : "grilla";
  /* filtro (categoría) → orden → buscador → cajones por sección */
  const filtrados = ordenarInventario(
    filtrarInventario(d.inventory, vista.invCategoria),
    vista.invOrden,
    { usos },
  );
  /* con un filtro de categoría puesto, un cajón sin prendas no aporta: se oculta */
  const conFiltro = categoriaValida(vista.invCategoria) !== "todas";
  const grupos = agruparPorSeccion(filtrados, todas, { buscar: vista.busqueda })
    .filter(g => !conFiltro || g.productos.length);
  const totales = grupos.reduce((n, g) => n + g.productos.length, 0);
  const visibles = filtrados.filter((p) => !normalizar(vista.busqueda) || normalizar(p.name).includes(normalizar(vista.busqueda)));
  pintarStats([
    { b: d.inventory.length, s: "Productos" },
    { b: todas.length, s: "Secciones" },
  ]);

  /* sin nada en el inventario: vacío con salida (no se muestran cajones) */
  if (!d.inventory.length) {
    main.innerHTML = `<div class="vacio anim-entra"><div class="viso">${VACIO_SVG.inventario}</div><b>Inventario vacío</b><p>Agregá tus productos con nombre, precio y foto.<br>Después los elegís al crear un pedido.</p><button class="btn btn-primario btn-vacio" data-acc="nuevo">Agregar producto</button></div>`;
    main.querySelectorAll("[data-acc='nuevo']").forEach(b => b.onclick = () => abrirEditorInventario(null));
    return;
  }

  const barra = barraHTML(d.inventory, visibles);

  /* sin coincidencias (buscador o filtro): vacío que explica y deja limpiar */
  if (!totales) {
    const filtro = hayFiltro({ categoria: vista.invCategoria, orden: vista.invOrden });
    const detalle = vista.busqueda
      ? `Nada coincide con “${esc(vista.busqueda)}”${categoriaValida(vista.invCategoria) !== "todas" ? ` y el filtro ${esc(categoria(categoriaValida(vista.invCategoria)).label)}` : ""}.`
      : `No hay prendas en ${esc(categoria(categoriaValida(vista.invCategoria)).label)}.`;
    main.innerHTML = `${barra}
      <div class="vacio anim-entra"><div class="viso">${VACIO_SVG.buscar}</div><b>Sin resultados</b>
        <p>${detalle} Probá con otro nombre${filtro ? " o quitá los filtros" : ""}.</p>
        ${filtro ? `<button class="btn btn-primario btn-vacio" data-acc="limpiar-filtros">Quitar filtros</button>` : ""}
      </div>`;
    cablearBarra(main);
    return;
  }

  main.innerHTML = `${barra}
    ${grupos.map(g => cajonHTML(g, { conAcciones: !vista.busqueda && (!!g.id), modo, usos })).join("")}
    <div class="sec-pie">
      <button class="btn sec-nueva" data-acc="secciones">${ICONO.lista}<span>Secciones</span></button>
      <p class="sec-nota">Los productos siguen en el inventario: cambia dónde se guardan, no se borra nada.</p>
    </div>`;

  cablearBarra(main);
  cablearGrilla(main);
  cablearCajones(main);
  main.querySelectorAll("[data-acc='secciones']").forEach(b => b.onclick = () => abrirHojaSecciones());
  main.querySelectorAll("[data-acc='nuevo']").forEach(b => b.onclick = () => abrirEditorInventario(null));
}

/** Chips, orden y vista alterna: filtran sin tocar los datos. */
function cablearBarra(main) {
  main.querySelectorAll("[data-inv-cat]").forEach(b => b.onclick = () => {
    vista.invCategoria = categoriaValida(b.dataset.invCat);
    emitirVista();
  });
  const sel = main.querySelector("#inv-orden");
  if (sel) sel.onchange = () => {
    vista.invOrden = sel.value;
    emitirVista();
  };
  const btn = main.querySelector("#inv-vista");
  if (btn) btn.onclick = () => {
    vista.invVista = vista.invVista === "lista" ? "grilla" : "lista";
    emitirVista();
  };
  main.querySelectorAll("[data-acc='limpiar-filtros']").forEach(b => b.onclick = () => {
    vista.invCategoria = "todas";
    vista.invOrden = ORDEN_DEFECTO;
    emitirVista();
  });
}

function cablearGrilla(main) {
  qsa(".inv-card, .inv-fila", main).forEach(card => {
    card.onclick = e => {
      if (e.target.closest(".inv-acciones")) return;
      card.focus({ preventScroll: true });
      abrirLightbox((productos().find(x => x.id === card.dataset.id) || {}).photo);
    };
    card.onkeydown = e => { if (e.target === card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); card.click(); } };
  });
  qsa(".inv-acciones button", main).forEach(b => b.onclick = async e => {
    e.stopPropagation();
    const p = productos().find(x => x.id === b.dataset.id);
    if (b.dataset.act === "del") {
      if (!(await confirmar({ title: "¿Eliminar este producto?", msg: "Se quita del inventario. Los pedidos ya guardados no cambian.", ok: "Eliminar producto" }))) return;
      eliminarProducto(p.id);
      toast("Producto eliminado");
    } else abrirEditorInventario(p);
  });
}

/* Plegar/desplegar un cajón repinta solo ese cajón (no la pantalla entera). */
function cablearCajones(main) {
  qsa(".sec-toggle", main).forEach(btn => {
    btn.onclick = () => {
      const clave = btn.dataset.secToggle === "sin" ? null : btn.dataset.secToggle;
      if (plegadas.has(clave)) plegadas.delete(clave); else plegadas.add(clave);
      const sec = btn.closest(".sec");
      const abierto = !plegadas.has(clave);
      btn.setAttribute("aria-expanded", String(abierto));
      sec.classList.toggle("plegada", !abierto);
      const cuerpo = sec.querySelector(".sec-body");
      if (cuerpo) cuerpo.hidden = !abierto;
    };
  });
  /* las acciones de la cabecera las resuelve la hoja de secciones */
  qsa("[data-sec-act]", main).forEach(b => b.onclick = e => {
    e.stopPropagation();
    const id = b.dataset.sec === "sin" ? null : b.dataset.sec;
    abrirHojaSecciones({ seccionId: id, accion: b.dataset.secAct });
  });
}
