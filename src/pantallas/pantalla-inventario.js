// pantalla-inventario.js — inventario agrupado por secciones propias (decisión B):
// cajones plegables con contador y caret, grilla 3× con foto (o ícono SVG de categoría),
// editar/eliminar con confirmación, lightbox y hoja "Secciones" para ordenar todo.
import { esc, qsa } from "../ui/dom.js";
import { fmt } from "../nucleo/nucleo.js";
import { db, productos, eliminarProducto, secciones } from "../estado/store.js";
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

/* Cajones plegados por la clienta (solo estado de pantalla, no se guarda). */
const plegadas = new Set();

function cardHTML(i) {
  return `<div class="inv-card" tabindex="0" role="button" aria-label="Ver foto de ${esc(i.name)}" data-id="${i.id}">
    ${i.photo
      ? `<div class="inv-foto-wrap">${esFotoDemo(i.photo) ? `<span class="demo-marca-foto">DEMO</span>` : ""}<img class="inv-foto" src="${esc(i.photo)}" alt=""></div>`
      : `<div class="inv-ph">${svgCategoria(i.cat)}</div>`}
    <div class="inv-cuerpo"><h4>${esc(i.name)}</h4><p>${fmt(i.price)}${i.cat ? ` · ${esc(categoria(i.cat).label)}` : ""}</p></div>
    <div class="inv-acciones">
      <button class="e" data-act="edit" data-id="${i.id}" aria-label="Editar ${esc(i.name)}">${ICONO.pencil}</button>
      <button class="d" data-act="del" data-id="${i.id}" aria-label="Eliminar ${esc(i.name)}">${ICONO.trash}</button>
    </div>
  </div>`;
}

/** Un cajón: cabecera-botón que pliega/despliega + grilla. */
function cajonHTML(grupo, { conAcciones }) {
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
        ? `<div class="inv stagger">${grupo.productos.map(cardHTML).join("")}</div>`
        : `<p class="sec-vacia">Todavía no hay prendas acá. Editá una prenda y elegí esta sección.</p>`}
    </div>
  </section>`;
}

export function pintarInventario(main) {
  const d = db();
  const todas = secciones();
  const grupos = agruparPorSeccion(d.inventory, todas, { buscar: vista.busqueda });
  const totales = grupos.reduce((n, g) => n + g.productos.length, 0);
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

  /* búsqueda sin coincidencias: el mismo vacío de siempre, con un atajo a secciones */
  if (!totales) {
    main.innerHTML = `<div class="vacio anim-entra"><div class="viso">${VACIO_SVG.buscar}</div><b>Sin resultados</b><p>Nada coincide con “${esc(vista.busqueda)}”. Probá con otro nombre.</p></div>`;
    return;
  }

  main.innerHTML = `${grupos.map(g => cajonHTML(g, { conAcciones: !vista.busqueda && (!!g.id) })).join("")}
    <div class="sec-pie">
      <button class="btn sec-nueva" data-acc="secciones">${ICONO.lista}<span>Secciones</span></button>
      <p class="sec-nota">Los productos siguen en el inventario: cambia dónde se guardan, no se borra nada.</p>
    </div>`;

  cablearGrilla(main);
  cablearCajones(main);
  main.querySelectorAll("[data-acc='secciones']").forEach(b => b.onclick = () => abrirHojaSecciones());
  main.querySelectorAll("[data-acc='nuevo']").forEach(b => b.onclick = () => abrirEditorInventario(null));
}

function cablearGrilla(main) {
  qsa(".inv-card", main).forEach(card => {
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
