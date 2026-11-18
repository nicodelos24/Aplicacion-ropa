// pantalla-inventario-editor.js — hoja alta/edición de producto (foto cámara/galería, categoría, precio validado).
// Fix QA F0F1: precio 0 bloqueado (>0) y alta arranca en "Accesorio / Otro" con el selector enfocado.
import { esc, qs, qsa } from "../ui/dom.js";
import { ICONO, svgCategoria } from "../ui/iconos.js";
import { esPrecioValido, parseMoneda } from "../nucleo/moneda.js";
import { CATEGORIAS, CATEGORIA_DEFECTO } from "../nucleo/catalogo.js";
import { crearProducto, editarProducto, productos } from "../estado/store.js";
import { abrirHoja, cerrarHoja } from "../ui/componentes/hoja.js";
import { toast } from "../ui/componentes/toast.js";
import { mostrarError } from "../ui/componentes/campo.js";
import { comprimirFoto } from "../servicios/fotos.js";
import { plantilla } from "../ui/plantilla.js";

export function abrirEditorInventario(orig) {
  const esNuevo = !orig;
  let cat = orig?.cat || CATEGORIA_DEFECTO;
  let foto = orig?.photo || null;

  const previa = d => d ? `<img class="inv-previa" src="${esc(d)}" alt="Foto del producto">` : "";

  abrirHoja(plantilla(HOJA, {
    titulo: esNuevo ? "Nuevo producto" : "Editar producto",
    previa: previa(foto),
    camara: ICONO.camera,
    imagen: ICONO.image,
    basura: ICONO.trash,
    cats: CATEGORIAS.map(c => plantilla(CAT, {
      id: c.id, label: c.label, svg: svgCategoria(c.id),
      on: cat === c.id ? "on" : "", pressed: String(cat === c.id),
    })).join(""),
    nombre: esc(orig?.name || ""),
    precio: orig?.price ?? "",
    guardar: esNuevo ? "Agregar al inventario" : "Guardar cambios",
  }));

  const updPrev = d => {
    foto = d;
    qs("#inv-prev").innerHTML = previa(d);
    qs("#inv-photo-del").classList.toggle("oculto", !d);
  };
  qsa("#seg-cat button").forEach(b => b.onclick = () => {
    cat = b.dataset.k;
    qsa("#seg-cat button").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
  });
  qs("#camBtn").onclick = () => qs("#inv-cam").click();
  qs("#photoBtn").onclick = () => qs("#inv-photo").click();
  qs("#inv-photo-del").onclick = () => updPrev(null);
  const tomar = e => { const f = e.target.files[0]; if (f) comprimirFoto(f).then(updPrev).catch(er => toast(er.message, "err")); };
  qs("#inv-cam").onchange = tomar;
  qs("#inv-photo").onchange = tomar;
  qs("#inv-cancelar").onclick = cerrarHoja;
  if (esNuevo && !orig?.cat) {
    const segCat = qs("#seg-cat");
    segCat.setAttribute("tabindex", "-1");
    segCat.focus({ preventScroll: false });
  }
  qs("#inv-save").onclick = () => {
    const name = qs("#inv-name").value.trim();
    if (!name) { mostrarError(qs("#inv-name"), "Escribí el nombre del producto"); return; }
    const precioTexto = qs("#inv-price").value;
    if (!esPrecioValido(precioTexto)) {
      mostrarError(qs("#inv-price"), "Precio inválido: solo números y un punto (ej. 1200 o 1250.50)");
      return;
    }
    if (precioTexto.trim() !== "" && (parseMoneda(precioTexto) ?? 0) <= 0) {
      mostrarError(qs("#inv-price"), "El precio debe ser mayor a $0");
      return;
    }
    const datos = { name, price: precioTexto, cat, photo: foto };
    const r = esNuevo ? crearProducto(datos) : editarProducto(orig.id, datos);
    if (!r.ok) { mostrarError(qs("#inv-price"), r.error || "No se pudo guardar"); return; }
    cerrarHoja(); toast("Inventario actualizado");
  };
}

const HOJA = `
  <div class="agarre"></div>
  <h2>{{titulo}}</h2>
  <div id="inv-prev">{{previa}}</div>
  <input type="file" id="inv-photo" accept="image/*" class="oculto">
  <input type="file" id="inv-cam" accept="image/*" capture="environment" class="oculto">
  <div class="foto-acciones">
    <button class="btn btn-ghost" id="camBtn">{{camara}} Tomar foto</button>
    <button class="btn btn-ghost" id="photoBtn">{{imagen}} Galería</button>
    <button class="btn btn-ghost oculto" id="inv-photo-del">{{basura}} Quitar</button>
  </div>
  <fieldset class="campo-seg">
    <legend class="campo-label">Tipo de prenda</legend>
    <div class="seg" id="seg-cat" role="group" aria-label="Tipo de prenda">{{cats}}</div>
  </fieldset>
  <label class="campo"><span class="campo-label">Nombre</span>
    <input id="inv-name" value="{{nombre}}" placeholder="Ej. Camisola Angélica"></label>
  <label class="campo"><span class="campo-label">Precio</span>
    <input id="inv-price" inputmode="numeric" value="{{precio}}" placeholder="$"></label>
  <button class="btn btn-primario" id="inv-save">{{guardar}}</button>
  <button class="btn btn-ghost" id="inv-cancelar">Cancelar</button>`;

const CAT = `<button data-k="{{id}}" class="{{on}}" aria-pressed="{{pressed}}">{{svg}} {{label}}</button>`;
