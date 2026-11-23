// pantalla-pedido-item-editor.js — hoja «Editar este artículo»: desde el detalle del
// pedido, el artículo elegido se edita acá (foto, tipo de prenda, nombre y precio) y
// el cambio se guarda en ESE pedido, que se vuelve a pintar al guardar.
// Reusa lo que ya existe: el lightbox para ampliar la foto, el elegidor de foto
// compartido y los campos del artículo que también usa el editor de inventario
// (ui/componentes/campos-articulo.js). La regla del cambio vive en el núcleo
// (itemEditado) y se aplica en el store (editarItemPedido): esto edita el artículo
// DE ESTE PEDIDO, no el producto del inventario.
import { qs } from "../ui/dom.js";
import { ICONO } from "../ui/iconos.js";
import { fmt, parseMoneda, nombreItem, precioItem, qtyDe } from "../nucleo/index.js";
import { pedidoPorId, editarItemPedido } from "../estado/store.js";
import { abrirHoja, cerrarHoja, intentarCerrarHoja, alCerrarHoja } from "../ui/componentes/hoja.js";
import { toast } from "../ui/componentes/toast.js";
import { mostrarError } from "../ui/componentes/campo.js";
import { confirmar } from "../ui/componentes/confirmar.js";
import { abrirLightbox } from "../ui/componentes/lightbox.js";
import { fotoPickerHTML, conectarFotoPicker } from "../ui/componentes/foto-picker.js";
import {
  camposArticuloHTML, conectarCamposArticulo, previaArticuloHTML, ICONOS_FOTO,
} from "../ui/componentes/campos-articulo.js";
import { abrirDetallePedido } from "./pantalla-pedido-detalle.js";
import { plantilla } from "../ui/plantilla.js";

export function abrirEditorArticulo(pedidoId, indice) {
  const p = pedidoPorId(pedidoId);
  const item = p && (p.items || [])[indice];
  if (!item) { toast("Ese artículo ya no está en el pedido", "err"); return; }

  /* la cantidad no se toca desde acá: se muestra para que se entienda el total */
  const qty = qtyDe(item);
  const nombre = nombreItem(item);
  const textoPrecio = String(precioItem(item));
  let foto = item.foto ?? item.photo ?? null;

  abrirHoja(plantilla(HOJA, {
    titulo: "Editar este artículo",
    pedido: `${p.cliente || "Cliente"} · ${nombre || "artículo"}`,
    previa: previaArticuloHTML(foto),
    camara: ICONOS_FOTO.camara,
    imagen: ICONOS_FOTO.imagen,
    basura: ICONOS_FOTO.basura,
    verIcono: ICONO.image,
    campos: camposArticuloHTML({ prefijo: "it", nombre, precio: textoPrecio, cat: item.categoria || null }),
    fotoPicker: fotoPickerHTML({ camara: "it-cam", galeria: "it-photo" }),
    cantidad: cantidadHTML(qty, precioItem(item)),
  }));

  const campos = conectarCamposArticulo({
    prefijo: "it", cat: item.categoria || null, nombre, precio: textoPrecio,
  });

  /* el subtotal de la hoja sigue al precio mientras se escribe (si es válido) */
  const pintarCantidad = () => {
    qs("#it-cant").innerHTML = cantidadHTML(qty, parseMoneda(qs("#it-price").value) ?? precioItem(item));
  };
  qs("#it-price").oninput = pintarCantidad;

  const pintarFoto = (d) => {
    foto = d || null;
    qs("#it-prev").innerHTML = previaArticuloHTML(foto);
    qs("#it-photo-del").classList.toggle("oculto", !foto);
    qs("#it-ver").classList.toggle("oculto", !foto);
  };
  pintarFoto(foto);
  /* ampliar la foto: el mismo visor del detalle, solo para mirar (desde acá ya
     se está editando; las acciones de la tarjeta duplicarían esta hoja) */
  qs("#it-ver").onclick = () => { if (foto) abrirLightbox(foto); };
  const picker = conectarFotoPicker({ camara: "it-cam", galeria: "it-photo", alElegir: pintarFoto });
  qs("#camBtn").onclick = () => picker.elegir();
  qs("#photoBtn").onclick = () => picker.galeria();
  qs("#it-photo-del").onclick = () => pintarFoto(null);

  /* cambios sin guardar: nombre, precio, tipo o foto distintos a los del pedido */
  const fotoInicial = item.foto ?? item.photo ?? null;
  const hayCambios = () => campos.hayCambios() || (foto || null) !== fotoInicial;
  const puedeSalir = async () => hayCambios()
    ? !!(await confirmar({
        title: "¿Salir sin guardar el artículo?",
        msg: "Cambiaste este artículo y todavía no lo guardaste en el pedido.",
        ok: "Salir sin guardar",
      }))
    : true;
  alCerrarHoja(puedeSalir);

  qs("#it-cancelar").onclick = intentarCerrarHoja;
  qs("#it-save").onclick = () => {
    const leido = campos.leer();
    if (!leido.ok) return;
    const r = editarItemPedido(pedidoId, indice, {
      nombre: leido.nombre,
      /* vacío = deja el precio que ya tenía el artículo (no lo pone en $0) */
      precio: leido.textoPrecio === "" ? undefined : leido.precio,
      categoria: leido.cat,
      foto,
    });
    if (!r.ok) {
      mostrarError(r.campo === "nombre" ? qs("#it-name") : qs("#it-price"), r.error || "No se pudo guardar");
      return;
    }
    /* guardado: se vuelve al pedido ya actualizado (la tarjeta muestra el cambio).
       La guardia de esta hoja se suelta para que cerrar el detalle no pregunte
       por un artículo que sí se guardó. */
    alCerrarHoja(null);
    abrirDetallePedido(pedidoId);
    toast(`Artículo actualizado · ${fmt(precioItem(r.item) * qtyDe(r.item))}`);
  };
}

const cantidadHTML = (qty, precio) => plantilla(CANTIDAD, {
  qty,
  subtotal: fmt((Number.isFinite(precio) ? precio : 0) * qty),
});

const HOJA = `
  <div class="agarre"></div>
  <h2>{{titulo}}</h2>
  <p class="hint det-articulo-pedido">{{pedido}}</p>
  <div id="it-prev">{{previa}}</div>
  <div class="foto-acciones">
    <button class="btn btn-ghost oculto" id="it-ver">{{verIcono}} Ver foto ampliada</button>
  </div>
  <div class="cantidad-nota" id="it-cant">{{cantidad}}</div>
  {{fotoPicker}}
  <div class="foto-acciones">
    <button class="btn btn-ghost" id="camBtn">{{camara}} Tomar foto</button>
    <button class="btn btn-ghost" id="photoBtn">{{imagen}} Galería</button>
    <button class="btn btn-ghost oculto" id="it-photo-del">{{basura}} Quitar</button>
  </div>
  {{campos}}
  <button class="btn btn-primario" id="it-save">Guardar en el pedido</button>
  <button class="btn btn-ghost" id="it-cancelar">Cancelar</button>`;

const CANTIDAD = `<span class="cantidad-chip">Cantidad {{qty}} · no se toca desde acá</span> <b class="monto">{{subtotal}}</b>`;
