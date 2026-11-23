// pantalla-inventario-secciones.js — hoja para ordenar el inventario en secciones
// propias (decisión B): crear, renombrar, borrar y asignar prendas.
// Regla de oro: borrar una sección NUNCA borra productos; sus prendas vuelven a
// "Sin sección". Toda la validación y la escritura viven en el store.
import { esc, qs, qsa } from "../ui/dom.js";
import { ICONO } from "../ui/iconos.js";
import { abrirHoja, cerrarHoja } from "../ui/componentes/hoja.js";
import { mostrarError } from "../ui/componentes/campo.js";
import { confirmar } from "../ui/componentes/confirmar.js";
import { toast } from "../ui/componentes/toast.js";
import { fmt } from "../nucleo/index.js";
import { db, secciones, productos, crearSeccion, renombrarSeccion, eliminarSeccion, moverProductoASeccion, seccionPorId } from "../estado/store.js";
import { emitirVista } from "../estado/vista.js";
import { contarEnSeccion, SECCION_NOMBRE_MAX } from "../nucleo/secciones.js";

const USUARIO = () => { const d = db(); return (d.users || []).find(u => u.id === d.usuarioId) || { id: d.usuarioId, nombre: "Dueña" }; };
const idDe = (v) => (v === "sin" || !v ? null : v);

/** Abre la hoja de secciones. Con `seccionId` + `accion` arranca en esa acción. */
export function abrirHojaSecciones({ seccionId = null, accion = null } = {}) {
  abrirHoja(`<div class="agarre"></div><div id="sec-hoja"></div>`);
  pintarLista();
  if (seccionId && accion === "renombrar") pintarRenombrar(seccionId);
  else if (seccionId && accion === "borrar") pedirBorrar(seccionId);
  else if (seccionId && accion === "mover") pintarAsignar(seccionId);
}

/* ── lista de secciones ── */
function pintarLista() {
  const cont = qs("#sec-hoja");
  if (!cont) return;
  const lista = secciones();
  const inv = db().inventory;
  const sueltos = inv.filter(p => !p.seccionId || !lista.some(s => s.id === p.seccionId)).length;

  cont.innerHTML = `
    <div class="hoja-cab"><h2>Tus secciones</h2><button class="hbtn" data-x aria-label="Cerrar">${ICONO.x}</button></div>
    <p class="hoja-sub">Ordená el inventario como quieras. Borrar una sección no borra prendas.</p>
    <div class="sec-lista">
      ${lista.length ? lista.map(s => {
        const n = contarEnSeccion(inv, s.id);
        return `<div class="sec-fila" data-id="${esc(s.id)}">
          <button class="sec-fila-abre" data-sec="abrir" aria-label="Agregar o quitar prendas de ${esc(s.nombre)}">
            <span class="sec-fila-nombre">${esc(s.nombre)}</span>
            <span class="sec-cnt">${n}</span>
          </button>
          <span class="sec-mas">
            <button class="sec-acc" data-sec="renombrar" aria-label="Cambiar el nombre de ${esc(s.nombre)}">${ICONO.pencil}</button>
            <button class="sec-acc danger" data-sec="borrar" aria-label="Eliminar la sección ${esc(s.nombre)}">${ICONO.trash}</button>
          </span>
        </div>`;
      }).join("") : `<p class="sec-vacia">Todavía no armaste ninguna sección. Creá la primera abajo.</p>`}
      ${sueltos ? `<div class="sec-fila sin" data-id="sin">
        <span class="sec-fila-nombre">Sin sección</span><span class="sec-cnt">${sueltos}</span>
      </div>` : ""}
    </div>
    <div class="campo campo-sec-nueva">
      <span class="campo-label">Nueva sección</span>
      <div class="sec-nueva-fila">
        <input id="sec-nombre" type="text" maxlength="${SECCION_NOMBRE_MAX}" placeholder="Ej.: Dama · verano" autocomplete="off">
        <button class="btn btn-primario" data-acc="nueva">Crear</button>
      </div>
    </div>`;

  cont.querySelector("[data-x]").onclick = () => cerrarHoja();
  cont.querySelector("[data-acc='nueva']").onclick = crearDesdeInput;
  qs("#sec-nombre", cont).onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); crearDesdeInput(); } };
  qsa(".sec-fila", cont).forEach(fila => {
    const id = idDe(fila.dataset.id);
    const abre = fila.querySelector("[data-sec='abrir']");
    if (abre) abre.onclick = () => pintarAsignar(id);
    qsa("[data-sec]", fila).forEach(b => {
      if (b.dataset.sec === "renombrar") b.onclick = () => pintarRenombrar(id);
      else if (b.dataset.sec === "borrar") b.onclick = () => pedirBorrar(id);
      else if (b.dataset.sec === "abrir") b.onclick = () => pintarAsignar(id);
    });
  });
}

function crearDesdeInput() {
  const input = qs("#sec-nombre");
  if (!input) return;
  const r = crearSeccion(input.value, USUARIO());
  if (!r.ok) { mostrarError(input, r.error); return; }
  toast(`Sección “${r.seccion.nombre}” creada`);
  /* el cajón nuevo queda desplegado para empezar a cargarlo */
  recargarPantalla();
  pintarLista();
}

/* ── renombrar ── */
function pintarRenombrar(id) {
  const s = seccionPorId(id);
  if (!s) { pintarLista(); return; }
  const cont = qs("#sec-hoja");
  cont.innerHTML = `
    <div class="hoja-cab"><button class="hbtn" data-volver aria-label="Volver">${ICONO.chevIzq}</button><h2>Cambiar el nombre</h2><button class="hbtn" data-x aria-label="Cerrar">${ICONO.x}</button></div>
    <div class="campo">
      <span class="campo-label">Nombre de la sección</span>
      <input id="sec-nombre" type="text" maxlength="${SECCION_NOMBRE_MAX}" value="${esc(s.nombre)}" autocomplete="off">
    </div>
    <button class="btn btn-primario btn-ancho" data-acc="guardar">Guardar nombre</button>`;
  cont.querySelector("[data-x]").onclick = () => cerrarHoja();
  cont.querySelector("[data-volver]").onclick = () => pintarLista();
  const input = qs("#sec-nombre", cont);
  const guardar = () => {
    const r = renombrarSeccion(id, input.value, USUARIO());
    if (!r.ok) { mostrarError(input, r.error); return; }
    toast("Nombre actualizado");
    recargarPantalla();
    pintarLista();
  };
  cont.querySelector("[data-acc='guardar']").onclick = guardar;
  input.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); guardar(); } };
}

/* ── borrar (con confirmación propia del cajón) ── */
async function pedirBorrar(id) {
  const s = seccionPorId(id);
  if (!s) { pintarLista(); return; }
  const n = contarEnSeccion(db().inventory, id);
  const ok = await confirmar({
    title: `¿Eliminar la sección “${s.nombre}”?`,
    msg: n
      ? `Sus ${n} prenda${n > 1 ? "s" : ""} pasan a “Sin sección”. No se borra ningún producto.`
      : "La sección está vacía. Tus prendas no se tocan.",
    ok: "Eliminar sección",
  });
  if (!ok) return;
  const r = eliminarSeccion(id, USUARIO());
  if (!r.ok) { pintarLista(); return; }
  toast(r.movidos ? `Sección eliminada · ${r.movidos} a Sin sección` : "Sección eliminada");
  recargarPantalla();
  pintarLista();
}

/* ── asignar prendas: casillas de todas las prendas, marcadas si están en la sección ── */
function pintarAsignar(id) {
  const s = id ? seccionPorId(id) : null;
  if (!s) { pintarLista(); return; }
  const inv = productos();
  const cont = qs("#sec-hoja");
  cont.innerHTML = `
    <div class="hoja-cab"><button class="hbtn" data-volver aria-label="Volver">${ICONO.chevIzq}</button><h2>${esc(s.nombre)}</h2><button class="hbtn" data-x aria-label="Cerrar">${ICONO.x}</button></div>
    <p class="hoja-sub">Marcá las prendas que van en esta sección. Se pueden cambiar cuando quieras.</p>
    ${inv.length ? `<div class="sec-pick">
      ${inv.map(p => {
        const dentro = p.seccionId === id;
        return `<label class="sec-pick-fila">
          <input type="checkbox" data-pick="${esc(p.id)}" ${dentro ? "checked" : ""}>
          <span class="sec-pick-nombre">${esc(p.name)}</span>
          <span class="sec-pick-precio">${fmt(p.price)}</span>
        </label>`;
      }).join("")}
    </div>
    <button class="btn btn-primario btn-ancho" data-acc="aplicar">Guardar prendas</button>`
    : `<p class="sec-vacia">Tu inventario está vacío. Agregá prendas desde la pestaña Inventario.</p>`}`;

  cont.querySelector("[data-x]").onclick = () => cerrarHoja();
  cont.querySelector("[data-volver]").onclick = () => pintarLista();
  const aplicar = cont.querySelector("[data-acc='aplicar']");
  if (aplicar) aplicar.onclick = () => {
    const usuario = USUARIO();
    let movidas = 0;
    qsa("[data-pick]", cont).forEach(c => {
      const p = productos().find(x => x.id === c.dataset.pick);
      if (!p) return;
      const dentro = p.seccionId === id;
      if (c.checked && !dentro) { if (moverProductoASeccion(p.id, id, usuario).ok) movidas++; }
      else if (!c.checked && dentro) { moverProductoASeccion(p.id, null, usuario); movidas++; }
    });
    toast(movidas ? `${movidas} prenda${movidas > 1 ? "s" : ""} movida${movidas > 1 ? "s" : ""}` : "Sin cambios");
    recargarPantalla();
    pintarLista();
  };
}

/* repinta la pantalla de fondo (el inventario) sin cerrar la hoja */
function recargarPantalla() {
  try { emitirVista(); } catch { /* sin pantalla: nada que repintar */ }
}
