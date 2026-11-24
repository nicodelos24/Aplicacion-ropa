// pantalla-cliente-editor.js — alta/edición de cliente. Nada se guarda sin «Guardar»:
// cerrar con ediciones pendientes avisa antes de perderlas.
// La foto se elige con el mismo flujo de los artículos (cámara o galería,
// comprimida por servicios/fotos.js). Sin foto queda el avatar con inicial.
import { esc, qs } from "../ui/dom.js";
import { ICONO } from "../ui/iconos.js";
import { maskTel, fmtTel } from "../nucleo/contacto.js";
import { crearCliente, editarCliente, clientes, db } from "../estado/store.js";
import { abrirHoja, cerrarHoja, alCerrarHoja } from "../ui/componentes/hoja.js";
import { toast } from "../ui/componentes/toast.js";
import { mostrarError } from "../ui/componentes/campo.js";
import { confirmar } from "../ui/componentes/confirmar.js";
import { ICONOS_FOTO } from "../ui/componentes/campos-articulo.js";
import { fotoPickerHTML, conectarFotoPicker } from "../ui/componentes/foto-picker.js";
import { abrirHojaCliente, borrarCliente } from "./pantalla-cliente.js";

/** Vista previa: foto si hay, si no el avatar con la inicial (diseño aprobado). */
function previaClienteHTML(foto, nombre) {
  const inicial = esc((nombre || "?")[0].toUpperCase());
  return foto
    ? `<img class="inv-previa" src="${esc(foto)}" alt="Foto de ${esc(nombre)}">`
    : `<div class="avatar avatar-gran" aria-hidden="true">${inicial}</div>`;
}

export function abrirEditorCliente(c) {
  const esNuevo = !c;
  const cl = c || { name: "", tel: "", notas: "", foto: null };
  const pref = db().prefijo || "+598";
  let foto = cl.foto || null;
  abrirHoja(`<div class="agarre"></div><h2>${esNuevo ? "Nuevo cliente" : "Editar cliente"}</h2>
    <div id="ce-prev" class="ce-previa">${previaClienteHTML(foto, cl.name)}</div>
    <div class="foto-acciones">
      <button class="btn btn-ghost" id="ce-cam">${ICONOS_FOTO.camara} Tomar foto</button>
      <button class="btn btn-ghost" id="ce-gal">${ICONOS_FOTO.imagen} Elegir foto</button>
      <button class="btn btn-ghost ${foto ? "" : "oculto"}" id="ce-quit-foto" aria-label="Quitar la foto">${ICONOS_FOTO.basura} Quitar foto</button>
    </div>
    ${fotoPickerHTML({ camara: "ce-cam-input", galeria: "ce-gal-input" })}
    <label class="campo"><span class="campo-label">Nombre</span><input id="ce-name" value="${esc(cl.name)}" placeholder="Nombre del cliente"></label>
    <label class="campo"><span class="campo-label">WhatsApp · prefijo ${esc(pref)} se agrega solo</span><input id="ce-tel" inputmode="tel" value="${esc(cl.tel || "")}" placeholder="${esc(fmtTel("099123123", pref))}"></label>
    <label class="campo"><span class="campo-label">Notas</span><textarea id="ce-notas" rows="2">${esc(cl.notas || "")}</textarea></label>
    <button class="btn btn-primario" id="ce-save">Guardar</button>
    ${!esNuevo ? `<button class="btn btn-ghost danger" id="ce-del">${ICONO.trash} Eliminar cliente</button>` : ""}
    <button class="btn btn-ghost" id="ce-cancelar">Cancelar</button>`);

  /* cambios sin guardar: se compara lo que hay en pantalla contra el original */
  const hayCambios = () => {
    const ahora = {
      name: qs("#ce-name").value.trim(),
      tel: qs("#ce-tel").value.trim(),
      notas: qs("#ce-notas").value.trim(),
    };
    return ahora.name !== (cl.name || "").trim()
      || ahora.tel !== (cl.tel || "").trim()
      || ahora.notas !== (cl.notas || "").trim()
      || (foto || null) !== (cl.foto || null);
  };
  const puedeSalir = async () => hayCambios()
    ? !!(await confirmar({
        title: "¿Salir sin guardar el cliente?",
        msg: "Hay cambios en este cliente que todavía no guardaste.",
        ok: "Salir sin guardar",
      }))
    : true;
  alCerrarHoja(puedeSalir);

  const repintarPrev = () => {
    qs("#ce-prev").innerHTML = previaClienteHTML(foto, qs("#ce-name").value);
    const btn = qs("#ce-quit-foto");
    if (btn) btn.classList.toggle("oculto", !foto);
  };
  const quitarFoto = () => { foto = null; repintarPrev(); };

  /* elegir foto: un solo flujo compartido (ui/componentes/foto-picker.js) */
  const picker = conectarFotoPicker({
    camara: "ce-cam-input", galeria: "ce-gal-input",
    alElegir: (url) => { foto = url; repintarPrev(); },
  });
  qs("#ce-cam").onclick = () => picker.elegir();
  qs("#ce-gal").onclick = () => picker.galeria();
  const btnQuitar = qs("#ce-quit-foto");
  if (btnQuitar) btnQuitar.onclick = quitarFoto;

  qs("#ce-tel").oninput = e => { e.target.value = maskTel(e.target.value); };
  qs("#ce-cancelar").onclick = async () => {
    if (!(await puedeSalir())) return;
    if (esNuevo) cerrarHoja();
    else abrirHojaCliente(cl.id); /* reemplaza la hoja y limpia la guardia */
  };
  qs("#ce-save").onclick = () => {
    const name = qs("#ce-name").value.trim();
    if (!name) { mostrarError(qs("#ce-name"), "Escribí el nombre"); return; }
    const datos = { name, tel: qs("#ce-tel").value.trim(), notas: qs("#ce-notas").value.trim(), foto: foto || null };
    const r = esNuevo ? crearCliente(datos) : editarCliente(cl.id, datos);
    if (!r.ok) { mostrarError(qs("#ce-name"), r.error || "No se pudo guardar"); return; }
    cerrarHoja(); toast("Cliente guardado");
  };
  if (!esNuevo) qs("#ce-del").onclick = () => borrarCliente(cl);
}
