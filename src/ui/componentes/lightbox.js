// lightbox.js — foto ampliada accesible (Tab queda en los botones, Escape cierra).
// `acciones` (opcional): [{ label, icono, alTocar }] se muestran al pie de la
// foto ampliada. Cada acción cierra el visor y después hace lo suyo, así la hoja
// que la pidió queda al frente (editar un artículo del pedido, p. ej.).
import { ICONO } from "../iconos.js";
import { esc } from "../dom.js";
import { esFotoDemo } from "../../datos/fotos-demo.js";

/**
 * @param {string} src dataURL o URL de la foto
 * @param {{ acciones?: {label: string, icono?: string, alTocar: () => void}[] }} opciones
 */
export function abrirLightbox(src, { acciones = [] } = {}) {
  if (!src || document.querySelector(".lightbox")) return;
  const prev = document.activeElement;
  const ov = document.createElement("div");
  ov.className = "lightbox";
  ov.setAttribute("role", "dialog");
  ov.setAttribute("aria-modal", "true");
  ov.setAttribute("aria-label", "Foto ampliada");
  const marca = esFotoDemo(src) ? `<span class="demo-marca">Foto de prueba · Demo</span>` : "";
  const fila = acciones.length
    ? `<div class="lb-acciones">${acciones.map((a, k) =>
        `<button class="btn btn-primario" data-accion="${k}"${a.id ? ` id="${esc(a.id)}"` : ""}>${a.icono || ""} ${esc(a.label)}</button>`
      ).join("")}</div>`
    : "";
  ov.innerHTML = `${marca}<button class="lbx" aria-label="Cerrar imagen ampliada">${ICONO.x}</button><img src="${src}" alt="Foto ampliada">${fila}`;

  const fondo = [...document.querySelectorAll(".topbar, main, nav, .fab, .hoja")];
  const inertAntes = fondo.map(el => el.inert);
  const overflowAntes = document.body.style.overflow;
  fondo.forEach(el => (el.inert = true));
  document.body.style.overflow = "hidden";

  const cerrar = () => {
    ov.remove();
    document.removeEventListener("keydown", onKey);
    fondo.forEach((el, i) => (el.inert = inertAntes[i]));
    document.body.style.overflow = overflowAntes;
    if (prev && prev.isConnected) prev.focus({ preventScroll: true });
  };
  const botones = () => [...ov.querySelectorAll("button")];
  const onKey = e => {
    if (e.key === "Escape") { e.preventDefault(); cerrar(); }
    if (e.key === "Tab") {
      /* Tab cicla dentro del visor: el foco nunca se escapa a la pantalla de fondo */
      e.preventDefault();
      const bs = botones();
      const i = bs.indexOf(document.activeElement);
      const paso = e.shiftKey ? -1 : 1;
      bs[(i + paso + bs.length) % bs.length].focus({ preventScroll: true });
    }
  };
  ov.querySelector(".lbx").onclick = cerrar;
  ov.onclick = e => { if (e.target === ov) cerrar(); };
  acciones.forEach((a, k) => {
    const b = ov.querySelector(`[data-accion="${k}"]`);
    if (b) b.onclick = () => { cerrar(); a.alTocar(); };
  });
  document.body.appendChild(ov);
  document.addEventListener("keydown", onKey);
  /* el foco arranca en la acción (lo que la persona vino a hacer); sin acciones,
     en el botón de cerrar */
  const primero = acciones.length ? ov.querySelector(".lb-acciones .btn") : ov.querySelector(".lbx");
  (primero || ov).focus({ preventScroll: true });
}
