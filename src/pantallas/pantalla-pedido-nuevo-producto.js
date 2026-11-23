// pantalla-pedido-nuevo-producto.js — hoja «Nuevo producto» desde el detalle del
// pedido: alta del producto con foto opcional (cámara o galería) y, al guardar,
// el producto entra al inventario Y queda agregado como artículo del pedido
// (store: altaProductoEnPedido, una sola escritura). Sin foto no pasa nada: el
// artículo nace sin ella y la tarjeta del pedido muestra el avatar por categoría,
// el mismo fallback de todos los artículos sin foto.
// Reusa lo compartido: elegidor de foto (ui/componentes/foto-picker.js) y campos
// del artículo (ui/componentes/campos-articulo.js), como «Editar este artículo».
import { qs } from "../ui/dom.js";
import { fmt } from "../nucleo/index.js";
import { pedidoPorId, altaProductoEnPedido } from "../estado/store.js";
import { abrirHoja, cerrarHoja, intentarCerrarHoja, alCerrarHoja } from "../ui/componentes/hoja.js";
import { toast } from "../ui/componentes/toast.js";
import { mostrarError } from "../ui/componentes/campo.js";
import { confirmar } from "../ui/componentes/confirmar.js";
import { fotoPickerHTML, conectarFotoPicker } from "../ui/componentes/foto-picker.js";
import {
  camposArticuloHTML, conectarCamposArticulo, previaArticuloHTML, ICONOS_FOTO,
} from "../ui/componentes/campos-articulo.js";
import { CATEGORIA_DEFECTO } from "../nucleo/catalogo.js";
import { abrirDetallePedido } from "./pantalla-pedido-detalle.js";
import { plantilla } from "../ui/plantilla.js";

export function abrirNuevoProductoEnPedido(pedidoId) {
  const p = pedidoPorId(pedidoId);
  if (!p) { toast("Ese pedido ya no está", "err"); return; }

  let foto = null;
  abrirHoja(plantilla(HOJA, {
    titulo: "Nuevo producto",
    pedido: `Se agrega al pedido de ${p.cliente || "cliente"}`,
    previa: previaArticuloHTML(foto),
    camara: ICONOS_FOTO.camara,
    imagen: ICONOS_FOTO.imagen,
    basura: ICONOS_FOTO.basura,
    campos: camposArticuloHTML({ prefijo: "np", nombre: "", precio: "", cat: CATEGORIA_DEFECTO }),
    fotoPicker: fotoPickerHTML({ camara: "np-cam", galeria: "np-photo" }),
  }));

  const campos = conectarCamposArticulo({
    prefijo: "np", cat: CATEGORIA_DEFECTO, nombre: "", precio: "",
  });

  const pintarFoto = (d) => {
    foto = d || null;
    qs("#np-prev").innerHTML = previaArticuloHTML(foto);
    qs("#np-photo-del").classList.toggle("oculto", !foto);
  };
  pintarFoto(foto);
  /* elegir foto: un solo flujo compartido (ui/componentes/foto-picker.js) */
  const picker = conectarFotoPicker({ camara: "np-cam", galeria: "np-photo", alElegir: pintarFoto });
  qs("#camBtn").onclick = () => picker.elegir();
  qs("#photoBtn").onclick = () => picker.galeria();
  qs("#np-photo-del").onclick = () => pintarFoto(null);

  /* cambios sin guardar: nombre, precio, tipo o foto ya elegidos */
  const hayCambios = () => campos.hayCambios() || !!foto;
  const puedeSalir = async () => hayCambios()
    ? !!(await confirmar({
        title: "¿Salir sin guardar el producto?",
        msg: "Hay datos de este producto que todavía no guardaste en el pedido.",
        ok: "Salir sin guardar",
      }))
    : true;
  alCerrarHoja(puedeSalir);

  qs("#np-cancelar").onclick = intentarCerrarHoja;
  qs("#np-save").onclick = () => {
    const leido = campos.leer();
    if (!leido.ok) return;
    const r = altaProductoEnPedido(pedidoId, {
      name: leido.nombre, price: leido.textoPrecio, cat: leido.cat, photo: foto,
    });
    if (!r.ok) {
      mostrarError(r.campo === "nombre" ? qs("#np-name") : qs("#np-price"), r.error || "No se pudo guardar");
      return;
    }
    /* guardado: se vuelve al detalle ya actualizado (el artículo aparece como
       tarjeta; sin foto muestra el avatar por categoría). La guardia de esta hoja
       se suelta para que cerrar el detalle no pregunte por algo que sí se guardó. */
    alCerrarHoja(null);
    abrirDetallePedido(pedidoId);
    toast(`${r.producto.name} agregado al pedido · ${fmt(r.item.precio)}`);
  };
}

const HOJA = `
  <div class="agarre"></div>
  <h2>{{titulo}}</h2>
  <p class="hint det-articulo-pedido">{{pedido}}</p>
  <div id="np-prev">{{previa}}</div>
  {{fotoPicker}}
  <div class="foto-acciones">
    <button class="btn btn-ghost" id="camBtn">{{camara}} Tomar foto</button>
    <button class="btn btn-ghost" id="photoBtn">{{imagen}} Galería</button>
    <button class="btn btn-ghost oculto" id="np-photo-del">{{basura}} Quitar</button>
  </div>
  {{campos}}
  <button class="btn btn-primario" id="np-save">Agregar al pedido</button>
  <button class="btn btn-ghost" id="np-cancelar">Cancelar</button>`;
