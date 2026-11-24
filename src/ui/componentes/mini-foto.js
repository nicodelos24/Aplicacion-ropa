// mini-foto.js — miniatura cuadrada de una prenda, con el avatar por categoría
// cuando no tiene foto. La usa la hoja de secciones para que se reconozca cada
// artículo de un vistazo al organizarlo.
import { esc } from "../dom.js";
import { svgCategoria } from "../iconos.js";
import { esFotoDemo } from "../../datos/fotos-demo.js";

/**
 * @param {{photo?: string, cat?: string, name?: string}} prenda
 * @param {string} [cls] clase extra para el envoltorio
 */
export function miniFotoHTML(prenda, cls = "") {
  const foto = prenda && prenda.photo;
  const marca = foto && esFotoDemo(foto) ? `<span class="demo-marca-foto">DEMO</span>` : "";
  const imagen = foto
    ? `<img src="${esc(foto)}" alt="">`
    : svgCategoria(prenda && prenda.cat);
  return `<span class="mini-foto ${cls}" aria-hidden="true">${marca}${imagen}</span>`;
}
