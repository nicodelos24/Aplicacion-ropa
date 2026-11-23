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

/* gesto: agarrar la barra y deslizar hacia abajo cierra */
function engancharGesto() {
  const h = hoja(), hi = hojaIn();
  const agarre = hi.querySelector(".agarre");
  if (!agarre) return;
  let y0 = null, dy = 0;
  const inicio = e => { y0 = (e.touches ? e.touches[0].clientY : e.clientY); h.classList.add("arrastrando"); };
  const mover = e => {
    if (y0 == null) return;
    dy = Math.max(0, (e.touches ? e.touches[0].clientY : e.clientY) - y0);
    hi.style.transform = `translateY(${dy}px)`;
    if (e.cancelable && dy > 10) e.preventDefault();
  };
  const soltar = () => {
    if (y0 == null) return;
    h.classList.remove("arrastrando");
    if (dy > 110) { intentarCerrarHoja(); }
    else hi.style.transform = "";
    y0 = null; dy = 0;
  };
  agarre.onpointerdown = e => { agarre.setPointerCapture(e.pointerId); inicio(e); };
  agarre.onpointermove = mover;
  agarre.onpointerup = soltar;
  agarre.onpointercancel = soltar;
}
