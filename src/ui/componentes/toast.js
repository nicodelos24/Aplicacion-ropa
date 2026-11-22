// toast.js — feedback con ícono animado y auto-cierre.
import { qs, esc, espacioToast } from "../dom.js";
import { ICONO } from "../iconos.js";

/* Un único temporizador para todos los avisos: al mostrar otro se rearma y al
   ocultar se cancela, para que ningún aviso quede flotando sobre el header. */
let timer = null;

function ocultar() {
  clearTimeout(timer);
  timer = null;
  const t = qs("#toast");
  if (!t) return;
  t.classList.remove("mostrar");
  espacioToast();
}

/** Cancela el aviso y su temporizador (cierre de hoja, cambio de sección). */
export function ocultarToast() { ocultar(); }

export function toast(mensaje, tipo = "ok") {
  const t = qs("#toast");
  if (!t) return;
  clearTimeout(timer);
  const ico = tipo === "err" || tipo === "warn" ? ICONO.alert : ICONO.check;
  t.className = `toast mostrar ${tipo}`;
  t.innerHTML = `<span class="toast-ico">${ico}</span><span>${esc(mensaje)}</span>`;
  espacioToast();
  timer = setTimeout(ocultar, tipo === "ok" ? 3000 : 4200);
}
