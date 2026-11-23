// pantalla-inventario-editor.js — hoja alta/edición de producto (foto cámara/galería, categoría, precio validado).
// Fix QA F0F1: precio 0 bloqueado (>0) y alta arranca en "Accesorio / Otro" con el selector enfocado.
// Nada se guarda sin «Guardar»: cerrar con ediciones pendientes avisa antes de perderlas.
// Los campos del artículo (tipo, nombre, precio + validación) y el elegidor de foto son
// compartidos (ui/componentes/campos-articulo.js y foto-picker.js): la hoja «Editar este
// artículo» del detalle de pedido usa los mismos, por eso ya no viven acá.
import { esc, qs } from "../ui/dom.js";
import { CATEGORIA_DEFECTO } from "../nucleo/catalogo.js";
import { CATEGORIAS_IDS } from "../nucleo/index.js";
import { crearProducto, editarProducto, secciones } from "../estado/store.js";
import { abrirHoja, cerrarHoja, intentarCerrarHoja, alCerrarHoja } from "../ui/componentes/hoja.js";
import { toast } from "../ui/componentes/toast.js";
import { mostrarError } from "../ui/componentes/campo.js";
import { confirmar } from "../ui/componentes/confirmar.js";
import { fotoPickerHTML, conectarFotoPicker } from "../ui/componentes/foto-picker.js";
import {
  camposArticuloHTML, conectarCamposArticulo, previaArticuloHTML, ICONOS_FOTO,
} from "../ui/componentes/campos-articulo.js";
import { plantilla } from "../ui/plantilla.js";

export function abrirEditorInventario(orig) {
  const esNuevo = !orig;
  const cat = orig?.cat || CATEGORIA_DEFECTO;
  let foto = orig?.photo || null;
  /* sección: la del producto o la que venía de la pantalla (null = Sin sección) */
  const listaSecciones = secciones();
  let seccionId = listaSecciones.some(s => s.id === orig?.seccionId) ? orig.seccionId : null;

  abrirHoja(plantilla(HOJA, {
    titulo: esNuevo ? "Nuevo producto" : "Editar producto",
    previa: previaArticuloHTML(foto),
    camara: ICONOS_FOTO.camara,
    imagen: ICONOS_FOTO.imagen,
    basura: ICONOS_FOTO.basura,
    campos: camposArticuloHTML({
      prefijo: "inv", nombre: orig?.name || "", precio: orig?.price ?? "", cat,
    }),
    fotoPicker: fotoPickerHTML({ camara: "inv-cam", galeria: "inv-photo" }),
    secciones: [
      `<option value="">Sin sección</option>`,
      ...listaSecciones.map(s => `<option value="${esc(s.id)}" ${seccionId === s.id ? "selected" : ""}>${esc(s.nombre)}</option>`),
    ].join(""),
    guardar: esNuevo ? "Agregar al inventario" : "Guardar cambios",
  }));

  const campos = conectarCamposArticulo({
    prefijo: "inv", cat, nombre: orig?.name || "", precio: orig?.price ?? "",
  });

  /* cambios sin guardar: se compara lo que hay en pantalla contra el original */
  const hayCambios = () => campos.hayCambios()
    || (foto || null) !== (orig?.photo || null)
    || (seccionId || "") !== (orig?.seccionId || "");
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
    qs("#inv-prev").innerHTML = previaArticuloHTML(d);
    qs("#inv-photo-del").classList.toggle("oculto", !d);
  };
  qs("#inv-sec").onchange = e => { seccionId = e.target.value || null; };
  /* elegir foto: un solo flujo compartido (ui/componentes/foto-picker.js) */
  const picker = conectarFotoPicker({ camara: "inv-cam", galeria: "inv-photo", alElegir: updPrev });
  qs("#camBtn").onclick = () => picker.elegir();
  qs("#photoBtn").onclick = () => picker.galeria();
  qs("#inv-photo-del").onclick = () => updPrev(null);
  qs("#inv-cancelar").onclick = intentarCerrarHoja;
  if (esNuevo && !orig?.cat) {
    const segCat = qs("#inv-cat");
    segCat.setAttribute("tabindex", "-1");
    segCat.focus({ preventScroll: false });
  }
  qs("#inv-save").onclick = () => {
    const leido = campos.leer();
    if (!leido.ok) return;
    const datos = { name: leido.nombre, price: leido.textoPrecio, cat: leido.cat, photo: foto, seccionId };
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
  {{campos}}
  <label class="campo"><span class="campo-label">Sección</span>
    <select id="inv-sec">{{secciones}}</select></label>
  <button class="btn btn-primario" id="inv-save">{{guardar}}</button>
  <button class="btn btn-ghost" id="inv-cancelar">Cancelar</button>`;
