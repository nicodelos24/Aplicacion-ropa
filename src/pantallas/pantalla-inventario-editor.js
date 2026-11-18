// pantalla-inventario-editor.js — hoja alta/edición de producto (foto cámara/galería, categoría, precio validado).
import { esc, qs, qsa } from "../ui/dom.js";
import { ICONO } from "../ui/iconos.js";
import { esPrecioValido, parseMoneda } from "../nucleo/moneda.js";
import { CATEGORIAS } from "../nucleo/catalogo.js";
import { crearProducto, editarProducto, productos } from "../estado/store.js";
import { abrirHoja, cerrarHoja } from "../ui/componentes/hoja.js";
import { toast } from "../ui/componentes/toast.js";
import { mostrarError } from "../ui/componentes/campo.js";
import { comprimirFoto } from "../servicios/fotos.js";

export function abrirEditorInventario(orig) {
  const esNuevo = !orig;
  let cat = orig?.cat || "vestido";
  let foto = orig?.photo || null;

  abrirHoja(`<div class="agarre"></div><h2>${esNuevo ? "Nuevo producto" : "Editar producto"}</h2>
    <div id="inv-prev">${foto ? `<img class="inv-foto" src="${esc(foto)}" style="border-radius:14px;margin-top:12px">` : ""}</div>
    <input type="file" id="inv-photo" accept="image/*" style="display:none">
    <input type="file" id="inv-cam" accept="image/*" capture="environment" style="display:none">
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-ghost" id="camBtn" style="margin:0;flex:1">${ICONO.camera} Tomar foto</button>
      <button class="btn btn-ghost" id="photoBtn" style="margin:0;flex:1">${ICONO.image} Galería</button>
      <button class="btn btn-ghost" id="inv-photo-del" style="margin:0;display:${foto ? "flex" : "none"}">${ICONO.trash} Quitar</button>
    </div>
    <fieldset><legend class="campo-label" style="margin-top:14px">Tipo de prenda (ícono)</legend><div class="seg" id="seg-cat" role="group" aria-label="Tipo de prenda">
      ${CATEGORIAS.map(c => `<button data-k="${c.id}" class="${cat === c.id ? "on" : ""}" aria-pressed="${cat === c.id}">${c.icono} ${c.label}</button>`).join("")}
    </div></fieldset>
    <label class="campo"><span class="campo-label" style="margin-top:6px">Nombre</span><input id="inv-name" value="${esc(orig?.name || "")}" placeholder="Ej. Camisola Angélica"></label>
    <label class="campo"><span class="campo-label">Precio</span><input id="inv-price" inputmode="numeric" value="${orig?.price ?? ""}" placeholder="$"></label>
    <button class="btn btn-primario" id="inv-save">${esNuevo ? "Agregar al inventario" : "Guardar cambios"}</button>
    <button class="btn btn-ghost" id="inv-cancelar">Cancelar</button>`);

  const updPrev = d => {
    foto = d;
    qs("#inv-prev").innerHTML = d ? `<img class="inv-foto" src="${esc(d)}" style="border-radius:14px;margin-top:12px">` : "";
    qs("#inv-photo-del").style.display = d ? "flex" : "none";
  };
  qsa("#seg-cat button").forEach(b => b.onclick = () => {
    cat = b.dataset.k;
    qsa("#seg-cat button").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
  });
  qs("#camBtn").onclick = () => qs("#inv-cam").click();
  qs("#photoBtn").onclick = () => qs("#inv-photo").click();
  qs("#inv-photo-del").onclick = () => updPrev(null);
  qs("#inv-cam").onchange = e => { const f = e.target.files[0]; if (f) comprimirFoto(f).then(updPrev).catch(er => toast(er.message, "err")); };
  qs("#inv-photo").onchange = e => { const f = e.target.files[0]; if (f) comprimirFoto(f).then(updPrev).catch(er => toast(er.message, "err")); };
  qs("#inv-cancelar").onclick = cerrarHoja;
  qs("#inv-save").onclick = () => {
    const name = qs("#inv-name").value.trim();
    if (!name) { mostrarError(qs("#inv-name"), "Escribí el nombre del producto"); return; }
    const precioTexto = qs("#inv-price").value;
    if (!esPrecioValido(precioTexto)) {
      mostrarError(qs("#inv-price"), "Precio inválido: solo números y un punto (ej. 1200 o 1250.50)");
      return;
    }
    const datos = { name, price: precioTexto, cat, photo: foto };
    const r = esNuevo ? crearProducto(datos) : editarProducto(orig.id, datos);
    if (!r.ok) { mostrarError(qs("#inv-price"), r.error || "No se pudo guardar"); return; }
    cerrarHoja(); toast("Inventario actualizado ✓");
  };
}
