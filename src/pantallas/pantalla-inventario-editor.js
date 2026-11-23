// pantalla-inventario-editor.js — hoja alta/edición de producto (foto cámara/galería, categoría, precio validado).
// Fix QA F0F1: precio 0 bloqueado (>0) y alta arranca en "Accesorio / Otro" con el selector enfocado.
// Nada se guarda sin «Guardar»: cerrar con ediciones pendientes avisa antes de perderlas.
import { esc, qs, qsa } from "../ui/dom.js";
import { ICONO, svgCategoria } from "../ui/iconos.js";
import { esPrecioValido, parseMoneda } from "../nucleo/moneda.js";
import { CATEGORIAS, CATEGORIA_DEFECTO } from "../nucleo/catalogo.js";
import { crearProducto, editarProducto, productos, secciones } from "../estado/store.js";
import { abrirHoja, cerrarHoja, intentarCerrarHoja, alCerrarHoja } from "../ui/componentes/hoja.js";
import { toast } from "../ui/componentes/toast.js";
import { mostrarError } from "../ui/componentes/campo.js";
import { confirmar } from "../ui/componentes/confirmar.js";
import { fotoPickerHTML, conectarFotoPicker } from "../ui/componentes/foto-picker.js";
import { plantilla } from "../ui/plantilla.js";

export function abrirEditorInventario(orig) {
  const esNuevo = !orig;
  let cat = orig?.cat || CATEGORIA_DEFECTO;
  let foto = orig?.photo || null;
  /* sección: la del producto o la que venía de la pantalla (null = Sin sección) */
  const listaSecciones = secciones();
  let seccionId = listaSecciones.some(s => s.id === orig?.seccionId) ? orig.seccionId : null;

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
    fotoPicker: fotoPickerHTML({ camara: "inv-cam", galeria: "inv-photo" }),
    secciones: [
      `<option value="">Sin sección</option>`,
      ...listaSecciones.map(s => `<option value="${esc(s.id)}" ${seccionId === s.id ? "selected" : ""}>${esc(s.nombre)}</option>`),
    ].join(""),
    guardar: esNuevo ? "Agregar al inventario" : "Guardar cambios",
  }));

  /* cambios sin guardar: se compara lo que hay en pantalla contra el original */
  const hayCambios = () => {
    const inicial = { name: (orig?.name || "").trim(), price: String(orig?.price ?? ""), cat: orig?.cat || CATEGORIA_DEFECTO, photo: orig?.photo || null, seccion: orig?.seccionId || "" };
    const ahora = { name: qs("#inv-name").value.trim(), price: qs("#inv-price").value.trim(), cat, photo: foto || null, seccion: seccionId || "" };
    return Object.keys(inicial).some((k) => inicial[k] !== ahora[k]);
  };
  const puedeSalir = async () => hayCambios()
    ? !!(await confirmar({
        title: "¿Salir sin guardar el producto?",
        msg: "Hay cambios en este producto que todavía no guardaste.",
        ok: "Salir sin guardar",
      }))
    : true;
  alCerrarHoja(puedeSalir);

  const updPrev = d => {
    foto = d;
    qs("#inv-prev").innerHTML = previa(d);
    qs("#inv-photo-del").classList.toggle("oculto", !d);
  };
  qsa("#seg-cat button").forEach(b => b.onclick = () => {
    cat = b.dataset.k;
    qsa("#seg-cat button").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
  });
  qs("#inv-sec").onchange = e => { seccionId = e.target.value || null; };
  /* elegir foto: un solo flujo compartido (ui/componentes/foto-picker.js) */
  const picker = conectarFotoPicker({ camara: "inv-cam", galeria: "inv-photo", alElegir: updPrev });
  qs("#camBtn").onclick = () => picker.elegir();
  qs("#photoBtn").onclick = () => picker.galeria();
  qs("#inv-photo-del").onclick = () => updPrev(null);
  qs("#inv-cancelar").onclick = intentarCerrarHoja;
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
    const datos = { name, price: precioTexto, cat, photo: foto, seccionId };
    const r = esNuevo ? crearProducto(datos) : editarProducto(orig.id, datos);
    if (!r.ok) { mostrarError(qs("#inv-price"), r.error || "No se pudo guardar"); return; }
    cerrarHoja(); toast("Inventario actualizado");
  };
}

const HOJA = `
  <div class="agarre"></div>
  <h2>{{titulo}}</h2>
  <div id="inv-prev">{{previa}}</div>
  {{fotoPicker}}
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
  <label class="campo"><span class="campo-label">Sección</span>
    <select id="inv-sec">{{secciones}}</select></label>
  <button class="btn btn-primario" id="inv-save">{{guardar}}</button>
  <button class="btn btn-ghost" id="inv-cancelar">Cancelar</button>`;

const CAT = `<button data-k="{{id}}" class="{{on}}" aria-pressed="{{pressed}}">{{svg}} {{label}}</button>`;
