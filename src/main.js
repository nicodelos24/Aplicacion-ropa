// main.js — arranque, ruteo por vistas, tema, cableado del shell.
// Dependencias hacia adentro: pantallas → ui → estado → datos → nucleo.
import { qs, qsa, espacioToast } from "./ui/dom.js";
import { ICONO } from "./ui/iconos.js";
import { boot, db, suscribir, setTema } from "./estado/store.js";
import { datosDemo } from "./datos/demo.js";
import { vista, emitirVista, suscribirVista, irA } from "./estado/vista.js";
import { aplicarTema } from "./pantallas/pantalla-ajustes.js";
import { pintarInicio } from "./pantallas/pantalla-inicio.js";
import { pintarPedidos } from "./pantallas/pantalla-pedidos.js";
import { pintarInventario } from "./pantallas/pantalla-inventario.js";
import { pintarContactos } from "./pantallas/pantalla-contactos.js";
import { pintarAgenda } from "./pantallas/pantalla-agenda.js";
import { pintarHistorial } from "./pantallas/pantalla-historial.js";
import { pintarAjustes } from "./pantallas/pantalla-ajustes.js";
import { abrirDetallePedido } from "./pantallas/pantalla-pedido-detalle.js";
import { abrirEditorPedido } from "./pantallas/pantalla-pedido-editor.js";
import { abrirEditorInventario } from "./pantallas/pantalla-inventario-editor.js";
import { abrirEditorCliente } from "./pantallas/pantalla-cliente-editor.js";
import { cerrarHoja, marcarCierrePorBack } from "./ui/componentes/hoja.js";
import { ocultarToast } from "./ui/componentes/toast.js";
import {
  estadoInicial, medirScroll, mostrar, mostrarPorPausa, ocultarPorInactividad,
  recorridoRueda, registrarActividad, INACTIVIDAD_MS, REAPARICION_MS,
} from "./ui/nav-scroll.js";

/* arranque: modo demo (?demo=1) o datos locales */
const DEMO = /[?&]demo=1/.test(location.search);
boot(DEMO ? datosDemo() : null);

const SUBTITULOS = {
  inicio: "Todo tu negocio en un vistazo",
  agenda: "Tu agenda",
  pedidos: "Catálogo de ventas",
  inventario: "Inventario de productos",
  contactos: "Tus contactos",
  historial: "Movimientos de cada cuenta",
  ajustes: "Configuración",
};
const CON_BUSQUEDA = ["pedidos", "inventario", "contactos"];
const CON_FAB = ["pedidos", "inventario", "contactos", "agenda"];

/* ---------- nav inferior auto-ocultable ----------
   Toda la lógica de decisión vive en src/ui/nav-scroll.js (pura, testeada).
   Acá solo se mide el documento, se marca el gesto del usuario y se aplica
   la clase en un rAF. Se usan fuentes separadas para no confundir saltos
   programáticos o inercia de borde con gestos reales. */
const navEl = qs("#nav");
let navEstado = estadoInicial();
let navSesion = { rueda: 0, gestoHasta: 0, ultimoStamp: 0 };
let navPintado = null;
let navFrame = 0;
let navTemporizador = 0;
const VENTANA_GESTO = 400;

function medirNav() {
  const d = document.documentElement;
  return {
    y: wScrollY(),
    altoContenido: Math.max(d.scrollHeight, d.clientHeight),
    altoVisible: d.clientHeight || wInnerHeight(),
  };
}
function wScrollY() { return typeof window !== "undefined" ? window.scrollY || 0 : 0; }
function wInnerHeight() { return typeof window !== "undefined" ? window.innerHeight || 0 : 0; }

function conGesto(ahora) {
  return navSesion.arrastrando === true || ahora < navSesion.gestoHasta || navSesion.rueda !== 0;
}
function capaAbierta() {
  return !!(qs("#hoja.abierta") || qs("#confirmar.abierta") || qs(".lightbox"));
}
function pintarNav() {
  navFrame = 0;
  if (navPintado === navEstado.visible) return;
  navPintado = navEstado.visible;
  navEl.classList.toggle("oculta", !navEstado.visible);
  navEl.setAttribute("aria-hidden", String(!navEstado.visible));
}
function programarPintado() {
  if (!navFrame) navFrame = requestAnimationFrame(pintarNav);
}
function reiniciarInactividad(ahora = Date.now()) {
  navEstado = registrarActividad(navEstado, ahora);
  clearTimeout(navTemporizador);
  /* Un único temporizador, rearmado en cada gesto: mientras se sigue bajando
     nunca vence, así la nav no "rebota" a mitad del desplazamiento.
     Visible → se oculta a los 3 s; oculta → vuelve a los 90 s; ya vuelta
     por pausa → no se reprograma hasta un gesto nuevo (no oscila). */
  if (navEstado.visible && !navEstado.mostradaPorPausa) {
    navTemporizador = setTimeout(() => {
      if (capaAbierta()) return;
      navEstado = ocultarPorInactividad(navEstado, Date.now());
      programarPintado();
    }, INACTIVIDAD_MS + 30);
  } else if (!navEstado.visible) {
    navTemporizador = setTimeout(() => {
      if (capaAbierta()) return;
      navEstado = mostrarPorPausa(navEstado, Date.now());
      programarPintado();
    }, REAPARICION_MS + 30);
  }
}
function navMostrar() {
  navEstado = mostrar(navEstado);
  navSesion.rueda = 0;
  navSesion.gestoHasta = 0;
  reiniciarInactividad();
  programarPintado();
}
function alScrollNav() {
  const ahora = Date.now();
  const stamp = wScrollY();
  if (stamp === navSesion.ultimoStamp) return;   // ruido / doble disparo
  navSesion.ultimoStamp = stamp;
  const muestra = medirNav();
  const gesto = conGesto(ahora) &&
    navEstado.altoVisible === muestra.altoVisible && navEstado.altoContenido === muestra.altoContenido;
  navEstado = medirScroll(navEstado, muestra, gesto);
  if (gesto) reiniciarInactividad(ahora);
  programarPintado();
}

/* Rueda: descuenta el recorrido real para no marcar como gesto un borde. */
window.addEventListener("wheel", e => {
  if (e.ctrlKey || e.defaultPrevented || !e.deltaY || capaAbierta()) return;
  const muestra = medirNav();
  const ahora = Date.now();
  /* No reanclar acá: el evento scroll posterior decide con el delta real del
     gesto. Reanclar aquí dejaría delta=0 y la nav nunca reaparecería al subir. */
  const delta = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? muestra.altoVisible : 1);
  const restante = ahora < navSesion.gestoHasta && Math.sign(navSesion.rueda) === Math.sign(delta) ? navSesion.rueda : 0;
  navSesion.rueda = recorridoRueda(muestra, restante + delta);
  /* La ventana de gesto se arma siempre: el evento `scroll` llega DESPUÉS del
     `wheel`, y para entonces `rueda` ya puede ser 0 (recorrido consumido). Si
     la ventana se borrara acá, el scroll se trataría como programático y la
     nav nunca reaparecería al subir. El borde ya queda descartado arriba. */
  navSesion.gestoHasta = ahora + VENTANA_GESTO;
  reiniciarInactividad(ahora);
}, { passive: true });

/* Táctil: arrastre = gesto; inercia de borde queda descartada por el ancla. */
window.addEventListener("touchstart", e => {
  if (capaAbierta()) return;
  navSesion.arrastrando = true;
  navSesion.rueda = 0;
  /* El toque SIEMPRE muestra: no armamos la ventana de gesto acá, o el
     scroll que viene con el mismo toque volvería a ocultar al instante.
     La ventana se arma en touchmove, cuando hay arrastre real. */
  navMostrar();
  navSesion.gestoHasta = 0;
}, { passive: true });
window.addEventListener("touchmove", () => {
  navSesion.gestoHasta = Date.now() + VENTANA_GESTO;
}, { passive: true });
const soltarTouch = () => {
  navSesion.arrastrando = false;
  navSesion.gestoHasta = Date.now() + VENTANA_GESTO;
};
window.addEventListener("touchend", soltarTouch, { passive: true });
window.addEventListener("touchcancel", soltarTouch, { passive: true });

/* Teclas de scroll también cuentan como gesto. */
const TECLAS_NAV = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "]);
window.addEventListener("keydown", e => {
  if (e.key === "Escape") return;
  const objetivo = e.target;
  if (objetivo && objetivo.closest && objetivo.closest("input, textarea, select, [contenteditable=true]")) return;
  if (TECLAS_NAV.has(e.key)) navSesion.gestoHasta = Date.now() + VENTANA_GESTO;
  else navMostrar();
});
window.addEventListener("scroll", alScrollNav, { passive: true });
window.addEventListener("resize", () => {
  navSesion.rueda = 0;
  navEstado = medirScroll(navEstado, medirNav(), false);  // reancla sin decidir
  programarPintado();
}, { passive: true });
/* Cualquier interacción (tap en nav, FAB, tema…) vuelve a mostrar. */
document.addEventListener("pointerdown", e => {
  if (e.target && e.target.closest && e.target.closest("#nav, #fab, #themeBtn")) navMostrar();
}, { passive: true });
/* Abrir una capa siempre deja la nav visible; el temporizador no la oculta. */
if (typeof MutationObserver !== "undefined") {
  new MutationObserver(() => {
    if (capaAbierta()) navMostrar();
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class"] });
}

reiniciarInactividad();
alScrollNav();

function render() {
  const v = vista.seccion;
  /* ningún aviso queda flotando sobre el header al cambiar de sección */
  ocultarToast();
  /* cada sección vuelve a arrancar con la nav visible */
  if (typeof navMostrar === "function") navMostrar();
  qs("#subtitle").textContent = SUBTITULOS[v] || "";
  qsa("#nav button").forEach(b => b.classList.toggle("on", b.dataset.v === v));

  const main = qs("#main");
  /* Reinicia la animación de entrada sin forzar layout: `void offsetWidth`
     provocaba un reflow sincrónico en cada cambio de sección. Cancelar la
     animación, quitar la clase y hacer una lectura de ESTILO (no de layout)
     antes de volver a ponerla logra el mismo reinicio a menor costo. */
  if (typeof main.getAnimations === "function") main.getAnimations().forEach(a => a.cancel());
  main.classList.remove("vista");
  void getComputedStyle(main).animationName;
  main.classList.add("vista");

  qs("#searchrow").style.display = CON_BUSQUEDA.includes(v) ? "flex" : "none";
  qs("#chips").style.display = v === "pedidos" ? "flex" : "none";
  if (!CON_BUSQUEDA.includes(v) && vista.busqueda) { vista.busqueda = ""; qs("#search").value = ""; }
  const fab = qs("#fab");
  fab.style.display = CON_FAB.includes(v) ? "flex" : "none";
  fab.innerHTML = ICONO.plus;

  if (v !== "pedidos") qs("#stats").innerHTML = "";
  try {
    if (v === "inicio") pintarInicio(main, abrirDetallePedido);
    else if (v === "pedidos") pintarPedidos(main, abrirDetallePedido);
    else if (v === "inventario") pintarInventario(main);
    else if (v === "contactos") pintarContactos(main);
    else if (v === "agenda") pintarAgenda(main, abrirDetallePedido);
    else if (v === "historial") pintarHistorial(main);
    else if (v === "ajustes") pintarAjustes(main);
  } catch (e) {
    console.error("render " + v, e);
    main.innerHTML = `<div class="vacio"><b>Algo falló al abrir esta sección</b><p>Probá cerrar y abrir la app.</p></div>`;
  }
  espacioToast();
}

suscribir(render);
suscribirVista(render);
render();

/* cableado del shell */
qsa("#nav button").forEach(b => b.onclick = () => irA(b.dataset.v));
qs("#search").oninput = e => { vista.busqueda = e.target.value; emitirVista(); };
qs("#themeBtn").onclick = () => {
  const nuevo = (db().theme || "dark") === "dark" ? "light" : "dark";
  setTema(nuevo);
  aplicarTema();
  if (vista.seccion === "ajustes") emitirVista();
};
aplicarTema();

qs("#fab").onclick = () => {
  const v = vista.seccion;
  if (v === "pedidos") abrirEditorPedido(null);
  else if (v === "inventario") abrirEditorInventario(null);
  else if (v === "contactos") abrirEditorCliente(null);
  else if (v === "agenda") abrirEditorPedido(null, null, vista.diaSel || undefined);
};

qs("#hoja").onclick = e => { if (e.target.id === "hoja") cerrarHoja(); };
window.addEventListener("resize", espacioToast);
window.addEventListener("keydown", e => { if (e.key === "Escape") cerrarHoja(); });

/* la entrada raíz también lleva la sección, para que "atrás" hasta el inicio sepa volver */
try { history.replaceState({ seccion: vista.seccion }, "", location.href); } catch (e) { /* sin history */ }

/* botón atrás del navegador: cierra la hoja o vuelve a la sección anterior */
window.addEventListener("popstate", e => {
  const h = qs("#hoja");
  if (h && h.classList.contains("abierta")) {
    marcarCierrePorBack(); /* ya vino del history: no volver a llamar a back() */
    cerrarHoja();
    return;
  }
  /* si no, navega a la sección del estado (o a inicio por defecto) */
  const destino = (e.state && e.state.seccion) || (location.hash || "").replace("#", "") || "inicio";
  if (destino !== vista.seccion) {
    vista.seccion = destino;
    emitirVista();
  }
});

/* service worker (PWA) */
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
