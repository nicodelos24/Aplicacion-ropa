// aviso-disco.js — pinta la franja de aviso de guardado (persistencia).
// Única boca para decirle a la dueña que el dispositivo rechazó el cambio o
// que lo guardó sin las fotos. El texto lo decide el núcleo (nucleo/avisos-disco.js);
// acá solo se dibuja y se cierra.
import { qs } from "../dom.js";
import { ICONO } from "../iconos.js";

let cerradoPorLaPersona = false;

/** Muestra el aviso (tipo: "error" | "aviso"). */
export function mostrarAvisoDisco(aviso) {
  if (!aviso) return;
  const cont = qs("#aviso-disco");
  if (!cont) return;
  cont.dataset.tono = aviso.tipo === "error" ? "error" : "aviso";
  qs("#aviso-disco-ico").innerHTML = aviso.tipo === "error" ? ICONO.alert : ICONO.clock;
  qs("#aviso-disco-titulo").textContent = aviso.titulo;
  qs("#aviso-disco-texto").textContent = aviso.texto;
  qs("#aviso-disco-x").innerHTML = ICONO.x;
  cont.hidden = false;
}

export function ocultarAvisoDisco() {
  const cont = qs("#aviso-disco");
  if (cont) cont.hidden = true;
}

/** ¿La persona ya cerró el aviso de arranque? */
export function avisoDiscoCerrado() { return cerradoPorLaPersona; }

export function cerrarAvisoDisco() {
  cerradoPorLaPersona = true;
  ocultarAvisoDisco();
}
