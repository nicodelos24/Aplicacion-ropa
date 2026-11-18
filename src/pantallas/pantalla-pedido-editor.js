// pantalla-pedido-editor.js — editor de pedido: cliente conocido, WhatsApp, productos del inventario o a mano,
// cuotas 2–12 solo en "En cuotas", fecha de entrega, notas; productos a mano entran solos al inventario.
// Fixes QA F0F1: precio 0 bloqueado (>0, P2) y cuotas fuera de rango con error inline, sin clamp silencioso (P3).
import { esc, qs, qsa } from "../ui/dom.js";
import { ICONO, svgCategoria } from "../ui/iconos.js";
import { fmt, parseMoneda, esPrecioValido } from "../nucleo/moneda.js";
import { ESTADOS, ORDEN_ESTADOS, CUOTAS_MIN, CUOTAS_MAX, cuotasValidas, estadoAlGuardar } from "../nucleo/pedidos.js";
import { maskTel } from "../nucleo/contacto.js";
import { CATEGORIAS } from "../nucleo/catalogo.js";
import {
  crearPedido, editarPedido, productos, clientes, db,
} from "../estado/store.js";
import { abrirHoja, cerrarHoja } from "../ui/componentes/hoja.js";
import { toast } from "../ui/componentes/toast.js";
import { mostrarError } from "../ui/componentes/campo.js";
import { comprimirFoto } from "../servicios/fotos.js";
import { abrirDetallePedido } from "./pantalla-pedido-detalle.js";

export function abrirEditorPedido(orig, presetCliente, presetDate) {
  const esNuevo = !orig;
  const inv = productos();
  const cls = clientes();

  const base = orig || {
    cliente: presetCliente ? presetCliente.name : "",
    tel: presetCliente ? presetCliente.tel : "",
    clienteId: presetCliente ? presetCliente.id : null,
    estado: "new", items: [], cuotas: CUOTAS_MIN, cuotasPagadas: 0, notas: "", fecha: presetDate || "",
  };
  // selección actual: ids del inventario ya en el pedido (edición) o del preset
  const selInicial = new Set((orig?.items || []).map(i => i.productoId).filter(Boolean));

  const invHTML = sel => {
    const items = inv.slice(0, 60);
    if (!items.length) return `<p class="nota-vacia">Tu inventario está vacío. Agregá productos en la pestaña Inventario.</p>`;
    return `<div class="pick-grid stagger">` + items.map(i => `
      <button class="pick ${sel.has(i.id) ? "on" : ""}" data-iid="${i.id}" aria-pressed="${sel.has(i.id)}">
        <span class="pickcheck">${ICONO.checkSolo}</span>
        ${i.photo ? `<img class="thumb" src="${esc(i.photo)}" alt="">` : `<div class="thumb ph">${svgCategoria(i.cat)}</div>`}
        <h5 class="contenedor-texto">${esc(i.name)}</h5><p>${fmt(i.price)}</p>
      </button>`).join("") + `</div>`;
  };

  abrirHoja(`<div class="agarre"></div><h2>${esNuevo ? (presetCliente ? `Nuevo pedido · ${esc(presetCliente.name)}` : "Nuevo pedido") : "Editar pedido"}</h2>
    <label class="campo"><span class="campo-label">Cliente</span><input id="f-cliente" value="${esc(base.cliente)}" placeholder="Nombre del cliente" list="clients-dl" autocomplete="off"></label>
    <datalist id="clients-dl">${cls.map(c => `<option value="${esc(c.name)}">`).join("")}</datalist>
    <div id="client-hint"></div>
    <label class="campo"><span class="campo-label">WhatsApp (opcional) · prefijo ${esc(db().prefijo || "+598")} se agrega solo</span><input id="f-tel" value="${esc(base.tel || "")}" inputmode="tel" placeholder="099 123 123"></label>
    <span class="campo-label campo-label-solo">Productos</span>
    <div class="seg seg-modo" id="mode-seg" role="group" aria-label="Modo de productos">
      <button data-m="inv" class="on">Del inventario</button>
      <button data-m="man">Escribir a mano</button>
    </div>
    <div id="mode-inv">${invHTML(selInicial)}</div>
    <div id="mode-man" class="oculto">
      <input type="file" id="man-photo" accept="image/*" capture="environment" class="oculto">
      <div id="plist"></div>
      <button class="addp" id="addp">Agregar producto</button>
    </div>
    <div class="totalbar"><span>Total</span><b id="ftotal" class="monto">${fmt(orig ? orig.items.reduce((s, i) => s + (Number(i.precio ?? i.price) || 0) * (Number(i.qty) || 1), 0) : 0)}</b></div>
    <label class="campo campo-est"><span class="campo-label">Estado</span>
      <div class="seg" id="seg-est" role="group" aria-label="Elegir estado">
        ${ORDEN_ESTADOS.map(k => `<button data-k="${k}" class="${base.estado === k ? "on " + ({ paid: "s-green", msg: "s-orange", due: "s-blue" }[k] || "") : ""}" aria-pressed="${base.estado === k}">${ESTADOS[k].l}</button>`).join("")}
      </div></label>
    <div id="cuotas-wrap" class="${base.estado === "due" ? "" : "oculto"}">
      <label class="campo"><span class="campo-label">Número de cuotas (2–12)</span><input id="f-cuotas" type="number" min="2" max="12" value="${base.cuotas || CUOTAS_MIN}"></label>
    </div>
    <label class="campo"><span class="campo-label">Fecha de entrega / recordatorio (opcional)</span><input id="f-fecha" type="date" value="${base.fecha || ""}"></label>
    <label class="campo"><span class="campo-label">Notas (opcional)</span><textarea id="f-notas" rows="2" placeholder="Ej. Entregar el viernes">${esc(base.notas || "")}</textarea></label>
    <button class="btn btn-primario" id="saveBtn">${esNuevo ? "Guardar pedido" : "Guardar cambios"}</button>
    <button class="btn btn-ghost" id="cancelar">Cancelar</button>`);

  let estado = base.estado;
  const picked = new Set(selInicial);
  let manuales = [{ nombre: "", precio: "", qty: 1, foto: null }];

  const calc = () => {
    let t = 0;
    picked.forEach(iid => { const p = productos().find(x => x.id === iid); if (p) t += (Number(p.price) || 0); });
    t += manuales.reduce((s, i) => s + (Number(parseMoneda(i.precio)) || 0), 0);
    qs("#ftotal").textContent = fmt(t);
  };

  const drawInv = () => {
    qs("#mode-inv").innerHTML = invHTML(picked);
    qsa("#mode-inv button").forEach(b => b.onclick = () => {
      if (picked.has(b.dataset.iid)) picked.delete(b.dataset.iid);
      else picked.add(b.dataset.iid);
      drawInv(); calc();
    });
  };

  const drawMan = () => {
    qs("#plist").innerHTML = manuales.map((it, i) => `
      <div class="prow">
        <input class="pn" data-i="${i}" value="${esc(it.nombre)}" placeholder="Producto" aria-label="Nombre del producto ${i + 1}">
        <input class="pp precio" data-i="${i}" value="${it.precio}" inputmode="numeric" placeholder="$" aria-label="Precio del producto ${i + 1}">
        <button class="foto mpic ${it.foto ? "tiene" : ""}" data-i="${i}" title="Foto" aria-label="Agregar foto al producto">${ICONO.camera}</button>
        <button class="quitar" data-i="${i}" aria-label="Quitar producto ${i + 1}">×</button>
      </div>`).join("") + (manuales.some(i => i.foto) ? `<div class="mini-previa">${manuales.filter(i => i.foto).map((i, k) => `<img src="${esc(i.foto)}" alt="">`).join("")}<span>Foto${manuales.filter(i => i.foto).length > 1 ? "s" : ""} listas: se guardan al confirmar</span></div>` : "");
    qsa(".pn").forEach(el => el.oninput = () => { manuales[el.dataset.i].nombre = el.value; });
    qsa(".pp").forEach(el => el.oninput = () => { manuales[el.dataset.i].precio = el.value; calc(); });
    qsa(".prow .quitar").forEach(el => el.onclick = () => { manuales.splice(el.dataset.i, 1); if (!manuales.length) manuales = [{ nombre: "", precio: "", qty: 1, foto: null }]; drawMan(); calc(); });
    qsa(".mpic").forEach(el => el.onclick = () => { manPhotoIdx = Number(el.dataset.i); qs("#man-photo").click(); });
  };

  let manPhotoIdx = null;
  qs("#man-photo").onchange = e => {
    const f = e.target.files[0]; e.target.value = "";
    if (f == null || manPhotoIdx == null) return;
    comprimirFoto(f).then(url => { manuales[manPhotoIdx].foto = url; manPhotoIdx = null; drawMan(); })
      .catch(er => toast(er.message || "No se pudo procesar la foto", "err"));
  };

  drawInv(); drawMan(); calc();
  qsa("#mode-seg button").forEach(x => x.classList.toggle("on", x.dataset.m === "inv"));
  qs("#mode-inv").classList.remove("oculto");
  qs("#mode-man").classList.add("oculto");

  qsa("#mode-seg button").forEach(b => b.onclick = () => {
    qsa("#mode-seg button").forEach(x => x.classList.toggle("on", x === b));
    qs("#mode-inv").classList.toggle("oculto", b.dataset.m !== "inv");
    qs("#mode-man").classList.toggle("oculto", b.dataset.m !== "man");
    calc();
  });

  qs("#addp").onclick = () => { manuales.push({ nombre: "", precio: "", qty: 1, foto: null }); drawMan(); };
  qsa("#seg-est button").forEach(b => b.onclick = () => {
    estado = b.dataset.k;
    qsa("#seg-est button").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    qs("#cuotas-wrap").classList.toggle("oculto", estado !== "due");
  });
  qs("#f-tel").oninput = e => { e.target.value = maskTel(e.target.value); };
  qs("#f-cliente").oninput = e => {
    const v = e.target.value.trim();
    const c = clientes().find(x => (x.name || "").toLowerCase() === v.toLowerCase());
    if (c) {
      qs("#client-hint").innerHTML = `<p class="hint hint-ok">${ICONO.checkSolo} Cliente conocido${c.tel ? " · " + esc(maskTel(c.tel)) : ""}</p>`;
      const telEl = qs("#f-tel");
      if (c.tel && !telEl.value.trim()) telEl.value = maskTel(c.tel);
    } else {
      qs("#client-hint").innerHTML = `<p class="hint">Nuevo cliente · se guardará automáticamente</p>`;
    }
  };
  qs("#cancelar").onclick = cerrarHoja;

  const errorCuotas = () => {
    const inp = qs("#f-cuotas");
    mostrarError(inp, "Entre 2 y 12 cuotas");
    return false;
  };

  qs("#saveBtn").onclick = () => {
    const cliente = qs("#f-cliente").value.trim();
    if (!cliente) { mostrarError(qs("#f-cliente"), "Escribí el nombre del cliente"); return; }
    for (const i of manuales) {
      if (i.nombre.trim() && !esPrecioValido(i.precio)) {
        mostrarError(qs("#saveBtn"), "Hay un precio inválido en los productos a mano");
        toast("Precio inválido en un producto", "warn");
        return;
      }
      if (i.nombre.trim() && i.precio.trim() !== "" && (parseMoneda(i.precio) ?? 0) <= 0) {
        mostrarError(qs(".pp[data-i='" + manuales.indexOf(i) + "']"), "El precio debe ser mayor a $0");
        toast("El precio no puede ser $0", "warn");
        return;
      }
    }
    const items = [];
    picked.forEach(iid => { const p = productos().find(x => x.id === iid); if (p) items.push({ productoId: p.id, nombre: p.name, precio: Number(p.price) || 0, foto: p.photo, categoria: p.cat, qty: 1 }); });
    const manualesLimpios = manuales.filter(i => i.nombre.trim());
    manualesLimpios.forEach(i => items.push({ productoId: null, nombre: i.nombre.trim(), precio: parseMoneda(i.precio) ?? 0, foto: i.foto, categoria: "otro", qty: 1 }));
    if (!items.length) { toast("Agregá al menos un producto", "warn"); return; }

    const cuotasEntrada = Number(qs("#f-cuotas")?.value) || CUOTAS_MIN;
    if (estado === "due" && cuotasValidas(cuotasEntrada) === null) { errorCuotas(); return; }
    const datos = {
      cliente,
      tel: qs("#f-tel").value.trim(),
      fecha: qs("#f-fecha").value,
      notas: qs("#f-notas").value.trim(),
      estado,
      cuotas: estado === "due" ? cuotasValidas(cuotasEntrada) : CUOTAS_MIN,
      items,
    };
    const r = esNuevo ? crearPedido(datos) : editarPedido(orig.id, { ...datos, cuotasPagadas: orig.cuotasPagadas });
    if (!r.ok) { toast(r.error || "No se pudo guardar", "err"); return; }
    cerrarHoja();
    toast(r.nuevosProductos ? `Guardado · ${r.nuevosProductos} producto${r.nuevosProductos > 1 ? "s" : ""} al inventario` : "Guardado");
  };
}
