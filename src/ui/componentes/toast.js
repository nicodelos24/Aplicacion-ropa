// toast.js — feedback con ícono animado y auto-cierre.
import { qs, esc, espacioToast } from "../dom.js";
import { ICONO } from "../iconos.js";

let timer = null;
export function toast(mensaje, tipo = "ok") {
  const t = qs("#toast");
  if (!t) return;
  clearTimeout(timer);
  const ico = tipo === "err" || tipo === "warn" ? ICONO.alert : ICONO.check;
  t.className = `toast mostrar ${tipo}`;
  t.innerHTML = `<span class="toast-ico">${ico}</span><span>${esc(mensaje)}</span>`;
  espacioToast();
  timer = setTimeout(() => { t.classList.remove("mostrar"); espacioToast(); }, tipo === "ok" ? 3000 : 4200);
}
