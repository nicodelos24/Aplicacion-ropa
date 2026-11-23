// campos-articulo.js — los campos que definen un artículo (foto, tipo de prenda,
// nombre y precio) en UNA sola implementación, con su validación.
//
// Antes vivían sueltos dentro del editor de inventario; la hoja «Editar este
// artículo» del detalle de pedido necesita exactamente los mismos campos y las
// mismas reglas (precio con decimales, cero bloqueado), así que se comparten
// en vez de duplicarse. Cada pantalla pone su propio encabezado y su botón.
import { esc, qs, qsa } from "../dom.js";
import { ICONO, svgCategoria } from "../iconos.js";
import { CATEGORIAS, CATEGORIAS_IDS, CATEGORIA_DEFECTO } from "../../nucleo/catalogo.js";
import { esPrecioValido, parseMoneda } from "../../nucleo/moneda.js";
import { PRECIO_INVALIDO, PRECIO_CERO } from "../../nucleo/pedidos.js";
import { mostrarError } from "./campo.js";

/** Foto previa del artículo (o nada si todavía no tiene). */
export function previaArticuloHTML(foto) {
  return foto ? `<img class="inv-previa" src="${esc(foto)}" alt="Foto del producto">` : "";
}

/**
 * HTML de los campos. Ids con prefijo (`${prefijo}-cat|name|price`) para que dos
 * hojas distintas no se pisen si alguna vez conviven. `cat: null` deja el
 * selector sin ninguna opción marcada.
 */
export function camposArticuloHTML({ prefijo, nombre = "", precio = "", cat = null }) {
  return `<fieldset class="campo-seg">
    <legend class="campo-label">Tipo de prenda</legend>
    <div class="seg" id="${prefijo}-cat" role="group" aria-label="Tipo de prenda">${CATEGORIAS.map((c) =>
      `<button data-k="${c.id}" class="${cat === c.id ? "on" : ""}" aria-pressed="${cat === c.id}">${svgCategoria(c.id)} ${c.label}</button>`
    ).join("")}</div>
  </fieldset>
  <label class="campo"><span class="campo-label">Nombre</span>
    <input id="${prefijo}-name" value="${esc(nombre)}" placeholder="Ej. Camisola Angélica"></label>
  <label class="campo"><span class="campo-label">Precio</span>
    <input id="${prefijo}-price" inputmode="numeric" value="${esc(precio)}" placeholder="$"></label>`;
}

/**
 * Conecta los campos. `cat` es el tipo con el que arranca la hoja (puede ser
 * null). `alElegirCat` avisa cada cambio de tipo, por si la pantalla lo usa.
 * `leer()` valida y devuelve `{ ok, nombre, textoPrecio, precio, cat }`; si algo
 * falla deja el error en el campo y devuelve `{ ok: false }`.
 * `hayCambios()` compara con lo que abrió la hoja.
 */
export function conectarCamposArticulo({ prefijo, cat = null, nombre = "", precio = "", alElegirCat = null }) {
  let tipo = CATEGORIAS_IDS.includes(cat) ? cat : null;
  qsa(`#${prefijo}-cat button`).forEach((b) => {
    b.onclick = () => {
      tipo = b.dataset.k;
      qsa(`#${prefijo}-cat button`).forEach((x) => {
        x.classList.toggle("on", x === b);
        x.setAttribute("aria-pressed", String(x === b));
      });
      if (alElegirCat) alElegirCat(tipo);
    };
  });
  const inpNombre = () => qs(`#${prefijo}-name`);
  const inpPrecio = () => qs(`#${prefijo}-price`);
  const valorNombre = () => inpNombre().value.trim();
  const valorPrecio = () => inpPrecio().value.trim();
  return {
    cat: () => tipo || CATEGORIA_DEFECTO,
    nombre: valorNombre,
    precio: valorPrecio,
    precioNumero: () => parseMoneda(inpPrecio().value),
    hayCambios: () => valorNombre() !== String(nombre).trim() || valorPrecio() !== String(precio).trim()
      || (tipo || null) !== (CATEGORIAS_IDS.includes(cat) ? cat : null),
    leer() {
      const n = valorNombre();
      if (!n) { mostrarError(inpNombre(), "Escribí el nombre del producto"); return { ok: false }; }
      const textoPrecio = valorPrecio();
      if (!esPrecioValido(textoPrecio)) { mostrarError(inpPrecio(), PRECIO_INVALIDO); return { ok: false }; }
      const p = parseMoneda(textoPrecio);
      if (p !== null && p <= 0) { mostrarError(inpPrecio(), PRECIO_CERO); return { ok: false }; }
      return { ok: true, nombre: n, textoPrecio, precio: p, cat: tipo || CATEGORIA_DEFECTO };
    },
  };
}

/** Iconos del bloque de foto, para las dos hojas. */
export const ICONOS_FOTO = { camara: ICONO.camera, imagen: ICONO.image, basura: ICONO.trash };
