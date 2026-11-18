// pantalla-inventario.js — grilla 3× con foto (o ícono SVG de categoría), editar/eliminar con confirmación, lightbox.
import { esc, qsa } from "../ui/dom.js";
import { fmt } from "../nucleo/nucleo.js";
import { db, productos, eliminarProducto } from "../estado/store.js";
import { vista } from "../estado/vista.js";
import { abrirLightbox } from "../ui/componentes/lightbox.js";
import { toast } from "../ui/componentes/toast.js";
import { confirmar } from "../ui/componentes/confirmar.js";
import { abrirEditorInventario } from "./pantalla-inventario-editor.js";
import { pintarStats } from "./pantalla-pedidos.js";
import { categoria } from "../nucleo/catalogo.js";
import { ICONO, VACIO_SVG, svgCategoria } from "../ui/iconos.js";

export function pintarInventario(main) {
  const d = db();
  const lista = productos().filter(i => !vista.busqueda || i.name.toLowerCase().includes(vista.busqueda.toLowerCase()));
  pintarStats([{ b: d.inventory.length, s: "Productos" }]);

  if (!lista.length) {
    main.innerHTML = vista.busqueda
      ? `<div class="vacio anim-entra"><div class="viso">${VACIO_SVG.buscar}</div><b>Sin resultados</b><p>Nada coincide con “${esc(vista.busqueda)}”. Probá con otro nombre.</p></div>`
      : `<div class="vacio anim-entra"><div class="viso">${VACIO_SVG.inventario}</div><b>Inventario vacío</b><p>Agregá tus productos con nombre, precio y foto.<br>Después los elegís al crear un pedido.</p><button class="btn btn-primario" style="max-width:240px;margin:0 auto" data-acc="nuevo">Agregar producto</button></div>`;
  } else {
    main.innerHTML = `<div class="inv stagger">${lista.map(i => `
      <div class="inv-card" tabindex="0" role="button" aria-label="Ver foto de ${esc(i.name)}" data-id="${i.id}">
        ${i.photo ? `<img class="inv-foto" src="${esc(i.photo)}" alt="">` : `<div class="inv-ph">${svgCategoria(i.cat)}</div>`}
        <div class="inv-cuerpo"><h4>${esc(i.name)}</h4><p>${fmt(i.price)}${i.cat ? ` · ${esc(categoria(i.cat).label)}` : ""}</p></div>
        <div class="inv-acciones">
          <button class="e" data-act="edit" data-id="${i.id}" aria-label="Editar ${esc(i.name)}">${ICONO.pencil}</button>
          <button class="d" data-act="del" data-id="${i.id}" aria-label="Eliminar ${esc(i.name)}">${ICONO.trash}</button>
        </div>
      </div>`).join("")}</div>`;

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
  main.querySelectorAll("[data-acc='nuevo']").forEach(b => b.onclick = () => abrirEditorInventario(null));
}
