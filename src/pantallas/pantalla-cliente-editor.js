// pantalla-cliente-editor.js — alta/edición de cliente.
import { esc, qs } from "../ui/dom.js";
import { ICONO } from "../ui/iconos.js";
import { maskTel, fmtTel } from "../nucleo/contacto.js";
import { crearCliente, editarCliente, clientes, db } from "../estado/store.js";
import { abrirHoja, cerrarHoja } from "../ui/componentes/hoja.js";
import { toast } from "../ui/componentes/toast.js";
import { mostrarError } from "../ui/componentes/campo.js";
import { abrirHojaCliente, borrarCliente } from "./pantalla-cliente.js";

export function abrirEditorCliente(c) {
  const esNuevo = !c;
  const cl = c || { name: "", tel: "", notas: "" };
  const pref = db().prefijo || "+598";
  abrirHoja(`<div class="agarre"></div><h2>${esNuevo ? "Nuevo cliente" : "Editar cliente"}</h2>
    <label class="campo"><span class="campo-label">Nombre</span><input id="ce-name" value="${esc(cl.name)}" placeholder="Nombre del cliente"></label>
    <label class="campo"><span class="campo-label">WhatsApp · prefijo ${esc(pref)} se agrega solo</span><input id="ce-tel" inputmode="tel" value="${esc(cl.tel || "")}" placeholder="${esc(fmtTel("099123123", pref))}"></label>
    <label class="campo"><span class="campo-label">Notas</span><textarea id="ce-notas" rows="2">${esc(cl.notas || "")}</textarea></label>
    <button class="btn btn-primario" id="ce-save">Guardar</button>
    ${!esNuevo ? `<button class="btn btn-ghost danger" id="ce-del">${ICONO.trash} Eliminar cliente</button>` : ""}
    <button class="btn btn-ghost" id="ce-cancelar">Cancelar</button>`);

  qs("#ce-tel").oninput = e => { e.target.value = maskTel(e.target.value); };
  qs("#ce-cancelar").onclick = () => esNuevo ? cerrarHoja() : abrirHojaCliente(cl.id);
  qs("#ce-save").onclick = () => {
    const name = qs("#ce-name").value.trim();
    if (!name) { mostrarError(qs("#ce-name"), "Escribí el nombre"); return; }
    const datos = { name, tel: qs("#ce-tel").value.trim(), notas: qs("#ce-notas").value.trim() };
    const r = esNuevo ? crearCliente(datos) : editarCliente(cl.id, datos);
    if (!r.ok) { mostrarError(qs("#ce-name"), r.error || "No se pudo guardar"); return; }
    cerrarHoja(); toast("Cliente guardado ✓");
  };
  if (!esNuevo) qs("#ce-del").onclick = () => borrarCliente(cl);
}
