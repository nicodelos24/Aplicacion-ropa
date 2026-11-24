// hoja.js — hoja inferior con agarre, cierre por gesto (drag hacia abajo) y Escape.
import { qs } from "../dom.js";
import { espacioToast } from "../dom.js";
import { ocultarToast } from "./toast.js";

const hoja = () => qs("#hoja");
const hojaIn = () => qs("#hoja-in");

/* si true, cerrarHoja NO toca history (porque el cierre ya vino del popstate) */
let cerrandoPorBack = false;
/* true mientras la hoja se está cerrando: evita reentrar desde popstate */
let cerrando = false;
export function marcarCierrePorBack() { cerrandoPorBack = true; }

/* Guardia de la hoja abierta: una función async que devuelve true si se puede
   cerrar. La carga la pantalla cuando tiene cambios sin guardar; SÓLO la limpia
   cerrarHoja (cierre forzado tras confirmar o guardar): abrirHoja la conserva
   para que reabrir el detalle no borre la guardia de una edición pendiente. */
let guardia = null;
/** Registra (o anula con null) la guardia de cambios sin guardar. */
export function alCerrarHoja(fn) { guardia = fn || null; }

export function abrirHoja(html) {
  const h = hoja(), hi = hojaIn();
  const yaAbierta = h.classList.contains("abierta");
  hi.innerHTML = html;
  hi.scrollTop = 0;
  h.className = "hoja abierta";
  hi.style.transform = "";
  /* registra la apertura como entrada de history para que "atrás" cierre la hoja */
  if (!yaAbierta && !cerrandoPorBack) {
    try { history.pushState({ hoja: 1 }, "", location.href); } catch (e) { /* sin history */ }
  }
  cerrandoPorBack = false;
  espacioToast();
  engancharGesto();
  const foco = hi.querySelector("h2");
  (foco || hi).setAttribute("tabindex", "-1");
  (foco || hi).focus({ preventScroll: true });
}

/* cierre forzado: lo que ya confirmó el usuario (guardado, entrada sin datos) */
export function cerrarHoja() {
  guardia = null;
  cerrarHojaForzado();
}

/** Cierre que respeta la guardia: avisa antes de perder cambios sin guardar. */
export async function intentarCerrarHoja() {
  if (guardia) {
    let puede = false;
    try { puede = await guardia(); } catch (e) { puede = false; }
    if (!puede) return false;
    guardia = null;
  }
  cerrarHojaForzado();
  return true;
}

/** ¿Hay cambios sin guardar en la hoja abierta? */
export function hayCambiosSinGuardar() { return !!guardia; }

function cerrarHojaForzado() {
  const h = hoja();
  if (!h.classList.contains("abierta") || cerrando) return;
  cerrando = true;
  ocultarToast();
  h.classList.add("cerrando");
  setTimeout(() => {
    h.className = "hoja";
    hojaIn().innerHTML = "";
    espacioToast();
    cerrando = false;
  }, 180);
  /* sincroniza el botón atrás del móvil: cerrar la hoja consume su entrada de history */
  if (!cerrandoPorBack) {
    try {
      if (history.state && history.state.hoja) history.back();
    } catch (e) { /* sin history */ }
  }
  cerrandoPorBack = false;
}

/* Gesto: agarrar la parte de arriba del panel y deslizar hacia abajo cierra.
   Se delega en #hoja (siempre presente) para cubrir también el contenido que
   se pinta después de abrir (p. ej. la hoja de secciones). Zona de agarre =
   barrita (.agarre), cabecera (.hoja-cab) o título h{1..6}. Se ignoran los
   controles (X, ayuda «?», inputs, tlones) para no romper el tap ni el scroll.
   El panel sigue al dedo y rebota si no pasa el umbral. */
const UMBRAL_CIERRE = 96;   // px de arrastre para cerrar
const RESBALON_MAX = 0.28;  // resistencia al querer subir

function esControl(el) {
  return !!(el && el.closest && el.closest("button, a, input, select, textarea, [data-x], [role=button], [data-ayuda]"));
}

function enZonaSuperior(hi, target) {
  if (esControl(target)) return false;
  if (target.closest(".agarre, .hoja-cab")) return true;
  const tit = target.closest && target.closest("h1, h2, h3, h4, h5, h6");
  if (tit && hi.contains(tit)) return true;
  return false;
}

function engancharGesto() {
  const h = hoja();
  if (!h || h.dataset.gesto === "1") return; // delegación persistente, una sola vez
  h.dataset.gesto = "1";
  let y0 = null, dy = 0, id = null;

  h.onpointerdown = (e) => {
    const hi = hojaIn();
    if (!h.classList.contains("abierta") || !enZonaSuperior(hi, e.target)) return;
    y0 = (e.touches ? e.touches[0].clientY : e.clientY);
    id = e.pointerId;
    h.classList.add("arrastrando");
    hi.style.transition = "none";
  };
  h.onpointermove = (e) => {
    if (y0 == null || (id != null && e.pointerId !== id)) return;
    const hi = hojaIn();
    const actual = (e.touches ? e.touches[0].clientY : e.clientY) - y0;
    dy = actual > 0 ? actual : actual * RESBALON_MAX;
    hi.style.transform = `translateY(${dy}px)`;
    h.style.setProperty("--arrastre-op", String(Math.max(0, 1 - dy / 420)));
    if (e.cancelable && dy > 6) e.preventDefault();
  };
  const soltar = () => {
    if (y0 == null) return;
    const hi = hojaIn();
    h.classList.remove("arrastrando");
    hi.style.transition = "";
    h.style.removeProperty("--arrastre-op");
    if (dy > UMBRAL_CIERRE) { hi.style.transform = ""; intentarCerrarHoja(); }
    else { hi.style.transform = ""; } // el CSS con transition rebota solo
    y0 = null; dy = 0; id = null;
  };
  h.onpointerup = soltar;
  h.onpointercancel = soltar;
}
