// foto-picker.js — elegir la foto de un producto desde la hoja (cámara o galería).
// Única implementación del flujo: los dos editores que eligen foto (inventario y
// pedido a mano) llamaban al mismo `comprimirFoto` con su propio par de
// <input type="file"> y su propio onchange: la lógica estaba duplicada.
//
// Acá se monta UNA vez por hoja: un input de cámara y otro de galería, ocultos,
// y la función que los dispara para un destino concreto (un callback que recibe
// el dataURL comprimido). El fallo se avisa con `toast` err, como antes.
import { comprimirFoto } from "../../servicios/fotos.js";
import { toast } from "./toast.js";
import { esc } from "../dom.js";

/**
 * HTML de los inputs ocultos (uno o dos). `galeria: null` deja solo la cámara,
 * para las hojas que ya funcionaban así.
 */
export function fotoPickerHTML({ camara = "foto-cam", galeria = "foto-gal" } = {}) {
  const uno = (id, extra) => `<input type="file" id="${esc(id)}" accept="image/*"${extra} class="oculto">`;
  return [camara && uno(camara, ' capture="environment"'), galeria && uno(galeria, "")].filter(Boolean).join("\n  ");
}

/**
 * Conecta los inputs a un destino.
 * `alElegir` recibe el dataURL comprimido (puede devolver una Promise; se
 * espera antes de rearmar el input). Devuelve `{ elegir() }`: dispara la cámara.
 */
export function conectarFotoPicker({ camara = "foto-cam", galeria = "foto-gal", alElegir }) {
  const tomar = (e) => {
    const input = e.target;
    const f = input.files && input.files[0];
    input.value = "";
    if (!f) return;
    comprimirFoto(f)
      .then((url) => alElegir(url))
      .catch((er) => toast(er.message || "No se pudo procesar la foto", "err"));
  };
  const ic = document.getElementById(camara);
  const ig = document.getElementById(galeria);
  if (ic) ic.onchange = tomar;
  if (ig) ig.onchange = tomar;
  const abrir = (id) => { const i = document.getElementById(id); if (i) i.click(); };
  return {
    elegir: () => abrir(camara),
    galeria: () => abrir(galeria),
  };
}
