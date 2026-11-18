// campo.js — campo con etiqueta, error inline, foco y aria-invalid (bloqueo sin mutar datos).
import { el, esc } from "../dom.js";
import { ICONO } from "../iconos.js";

export function mostrarError(input, msg) {
  input.setAttribute("aria-invalid", "true");
  const viejo = input.parentElement.querySelector(".ferr");
  if (viejo) viejo.remove();
  const d = el("div", "ferr", `${ICONO.alert}<span>${esc(msg)}</span>`);
  d.setAttribute("role", "alert");
  input.after(d);
  input.focus();
  input.addEventListener("input", () => { input.removeAttribute("aria-invalid"); d.remove(); }, { once: true });
  return d;
}

/** HTML de un campo: label + input con valor. */
export function campoHTML({ id, label, valor = "", placeholder = "", tipo = "text", inputmode, extra = "" }) {
  const idLabel = id + "-label";
  return `<label class="campo"><span class="campo-label" id="${idLabel}">${esc(label)}</span>
    <input id="${id}" type="${tipo}" ${inputmode ? `inputmode="${inputmode}"` : ""} value="${esc(valor)}" placeholder="${esc(placeholder)}" aria-labelledby="${idLabel}" ${extra}></label>`;
}
