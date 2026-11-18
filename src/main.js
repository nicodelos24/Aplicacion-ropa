// main.js — arranque, ruteo por vistas, tema, cableado del shell.
// Dependencias hacia adentro: pantallas → ui → estado → datos → nucleo.
import { qs, qsa, espacioToast } from "./ui/dom.js";
import { ICONO } from "./ui/iconos.js";
import { boot, db, suscribir, setTema } from "./estado/store.js";
import { datosDemo } from "./datos/demo.js";
import { vista, emitirVista, suscribirVista } from "./estado/vista.js";
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
import { cerrarHoja } from "./ui/componentes/hoja.js";

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

function render() {
  const v = vista.seccion;
  qs("#subtitle").textContent = SUBTITULOS[v] || "";
  qsa("#nav button").forEach(b => b.classList.toggle("on", b.dataset.v === v));

  const main = qs("#main");
  main.classList.remove("vista"); void main.offsetWidth; main.classList.add("vista");

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
qsa("#nav button").forEach(b => b.onclick = () => { vista.seccion = b.dataset.v; emitirVista(); });
qs("#search").oninput = e => { vista.busqueda = e.target.value; emitirVista(); };
qs("#themeBtn").onclick = () => {
  setTema((localStorage.getItem("ropa_v2_tema") || db().theme || "dark") === "dark" ? "light" : "dark");
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

/* service worker (PWA) */
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
