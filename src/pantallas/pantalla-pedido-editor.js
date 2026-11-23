// pantalla-pedido-editor.js — editor de pedido: cliente conocido, WhatsApp, productos del inventario o a mano,
// cuotas 2–12 solo en "En cuotas", fecha de entrega, notas; productos a mano entran solos al inventario.
// Nada se guarda sin «Guardar»: cerrar con ediciones pendientes avisa antes de perderlas.
// Fixes QA F0F1: precio 0 bloqueado (>0, P2) y cuotas fuera de rango con error inline, sin clamp silencioso (P3).
// Selector de productos (decisión Y, 23-nov): filas compactas dentro de cada sección, con badge
// «elegidos/total» en la cabecera plegable y buscador; filtrar nunca deselecciona ni cambia el total.
import { esc, qs, qsa } from "../ui/dom.js";
import { ICONO, svgCategoria } from "../ui/iconos.js";
import { fmt, parseMoneda, esPrecioValido } from "../nucleo/moneda.js";
import { ESTADOS, ORDEN_ESTADOS, CUOTAS_MIN, CUOTAS_MAX, cuotasValidas, estadoAlGuardar, qtyDe, subtotalItem } from "../nucleo/pedidos.js";
import { maskTel } from "../nucleo/contacto.js";
import { CATEGORIAS } from "../nucleo/catalogo.js";
import { gruposParaElegir, hayResultados, contarElegidos } from "../nucleo/pedido-picker.js";
import { usosPorProducto } from "../nucleo/orden.js";
import {
  crearPedido, editarPedido, productos, clientes, db, secciones, pedidos,
} from "../estado/store.js";
import { abrirHoja, cerrarHoja, alCerrarHoja } from "../ui/componentes/hoja.js";
import { toast } from "../ui/componentes/toast.js";
import { mostrarError } from "../ui/componentes/campo.js";
import { confirmar } from "../ui/componentes/confirmar.js";
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
  // Cantidad inicial por producto del inventario, desde el snapshot del pedido.
  // Un mismo producto puede aparecer en más de un ítem: se suman sus cantidades
  // (p. ej. 2× Medias lanas = qty 2) para que editar no pierda ni el total ni la cantidad.
  const qtyInicial = new Map();
  (orig?.items || []).forEach(i => {
    if (!i.productoId) return;
    qtyInicial.set(i.productoId, (qtyInicial.get(i.productoId) || 0) + qtyDe(i));
  });
  // selección actual: ids del inventario ya en el pedido (edición) o del preset
  const selInicial = new Set(qtyInicial.keys());
  const cantidades = new Map(qtyInicial); // copia de trabajo: el usuario puede cambiar la cantidad al editar
  const totalInicial = (orig?.items || []).reduce((s, i) => s + subtotalItem(i), 0);

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
    <div id="mode-inv">
      <div class="picker-buscar">
        <span class="picker-lupa">${ICONO.buscar}</span>
        <input id="pick-buscar" type="search" placeholder="Buscar en el inventario…" aria-label="Buscar prenda en el inventario" autocomplete="off">
      </div>
      <div id="pick-grupos"></div>
    </div>
    <div id="mode-man" class="oculto">
      <input type="file" id="man-photo" accept="image/*" capture="environment" class="oculto">
      <div id="plist"></div>
      <button class="addp" id="addp">Agregar producto</button>
    </div>
    <div class="totalbar"><span id="ftotal-lbl">Total</span><b id="ftotal" class="monto">${fmt(totalInicial)}</b></div>
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
  /* buscador y secciones plegadas del selector: solo estado de pantalla */
  let buscar = "";
  const plegadas = new Set();
  const usos = usosPorProducto(pedidos());

  /* ── cambios sin guardar ──
     El editor no escribe nada en el pedido hasta «Guardar»: se compara lo que
     hay en pantalla contra lo que abrió el editor y, si difiere, cerrar avisa. */
  const fotoActual = () => JSON.stringify({
    cliente: qs("#f-cliente").value.trim(),
    tel: qs("#f-tel").value.trim(),
    fecha: qs("#f-fecha")?.value || "",
    notas: qs("#f-notas").value.trim(),
    estado,
    cuotas: estado === "due" ? (qs("#f-cuotas")?.value || "") : "",
    items: [...picked].sort().map((iid) => [iid, cantidades.get(iid) || 1]),
    manuales: manuales
      .map((i) => [i.nombre.trim(), i.precio, i.foto || ""])
      .filter((x) => x[0] || x[1] || x[2]),
  });
  const fotoInicial = JSON.stringify({
    cliente: base.cliente || "",
    tel: base.tel || "",
    fecha: base.fecha || "",
    notas: base.notas || "",
    estado: base.estado,
    cuotas: base.estado === "due" ? String(base.cuotas || CUOTAS_MIN) : "",
    items: [...qtyInicial.entries()].map(([id, n]) => [id, n]).sort(),
    manuales: [],
  });
  const hayCambios = () => fotoActual() !== fotoInicial;
  const puedeSalir = async () => hayCambios()
    ? !!(await confirmar({
        title: "¿Salir sin guardar el pedido?",
        msg: "Hay cambios en este pedido que todavía no guardaste.",
        ok: "Salir sin guardar",
      }))
    : true;
  alCerrarHoja(puedeSalir);

  const calc = () => {
    let t = 0;
    picked.forEach(iid => {
      const p = productos().find(x => x.id === iid);
      if (p) t += (Number(p.price) || 0) * (cantidades.get(iid) || 1);
    });
    t += manuales.reduce((s, i) => s + (Number(parseMoneda(i.precio)) || 0) * (Number(i.qty) || 1), 0);
    qs("#ftotal").textContent = fmt(t);
    /* el contador dice cuántas prendas del inventario lleva el pedido */
    const n = contarElegidos(picked);
    qs("#ftotal-lbl").textContent = n
      ? `${n} producto${n > 1 ? "s" : ""} elegido${n > 1 ? "s" : ""}`
      : "Total";
  };

  /* Un grupo = una sección: cabecera plegable con badge elegidos/total + filas de 52 px.
     Los grupos los arma el núcleo (gruposParaElegir) y acá solo se cablean. */
  const filaHTML = (p) => {
    const on = picked.has(p.id);
    const n = cantidades.get(p.id) || 1;
    const qty = on
      ? `<span class="fila-stepper qtystep" data-qty="${p.id}">
           <button type="button" class="qtyminus" aria-label="Restar ${esc(p.name)}">−</button>
           <b aria-label="Cantidad ${n}">${n}</b>
           <button type="button" class="qtyplus" aria-label="Sumar ${esc(p.name)}">+</button>
         </span>`
      : "";
    return `<div class="pk-fila${on ? " on" : ""}" data-iid="${p.id}" role="button" tabindex="0" aria-pressed="${on}">
      <span class="pk-mini">${p.photo ? `<img src="${esc(p.photo)}" alt="">` : svgCategoria(p.cat)}</span>
      <span class="pk-txt"><b>${esc(p.name)}</b><small>${fmt(p.price)}</small></span>
      ${qty}
      <span class="pk-check" aria-hidden="true">${ICONO.checkSolo}</span>
    </div>`;
  };

  /* Pinta el selector completo en #pick-grupos (se repinta al elegir, buscar o plegar). */
  const drawInv = () => {
    const cont = qs("#pick-grupos");
    if (!cont) return;
    if (!inv.length) {
      cont.innerHTML = `<p class="nota-vacia">Tu inventario está vacío. Agregá productos en la pestaña Inventario.</p>`;
      return;
    }
    const grupos = gruposParaElegir(inv, secciones(), { buscar, elegidos: picked, usos });
    /* sin coincidencias: el vacío explica y sale, y abajo quedan los elegidos
       que se mantienen a la vista para no perder el hilo del pedido */
    const vacio = buscar.trim() && !hayResultados(grupos)
      ? `<div class="picker-vacio">
          <b>Ninguna prenda dice “${esc(buscar.trim())}”</b>
          <p>Probá con otra palabra o quitá la búsqueda.</p>
          <button type="button" class="btn btn-ghost" id="pick-limpiar">Quitar búsqueda</button>
        </div>`
      : "";
    cont.innerHTML = vacio + grupos.map(g => {
      const clave = g.id || "sin";
      const abierto = !plegadas.has(clave);
      const badge = g.hayElegidos
        ? `<span class="pk-badge on">${g.elegidos}/${g.total}</span>`
        : `<span class="pk-badge">${g.total}</span>`;
      const cuerpo = g.productos.length
        ? `<div class="pk-filas">${g.productos.map(filaHTML).join("")}</div>`
        : `<p class="pk-vacia">Todavía no hay prendas en esta sección.</p>`;
      return `<section class="pk-grupo${abierto ? "" : " plegada"}">
        <button type="button" class="pk-cab" data-pk-toggle="${esc(clave)}" aria-expanded="${abierto}" aria-controls="pk-body-${esc(clave)}">
          <span class="pk-nombre">${esc(g.nombre)}</span>
          ${badge}
          <span class="pk-caret">${ICONO.chevAbajo}</span>
        </button>
        <div class="pk-cuerpo" id="pk-body-${esc(clave)}" ${abierto ? "" : "hidden"}>${cuerpo}</div>
      </section>`;
    }).join("");

    const limpiar = qs("#pick-limpiar");
    if (limpiar) limpiar.onclick = () => { buscar = ""; qs("#pick-buscar").value = ""; drawInv(); qs("#pick-buscar").focus(); };

    /* elegir / deseleccionar una prenda */
    qsa("#pick-grupos .pk-fila").forEach(f => f.onclick = (e) => {
      if (e.target.closest(".qtystep")) return;
      const iid = f.dataset.iid;
      if (picked.has(iid)) { picked.delete(iid); cantidades.delete(iid); }
      else { picked.add(iid); cantidades.set(iid, 1); }
      drawInv(); calc();
    });
    qsa("#pick-grupos .pk-fila").forEach(f => f.onkeydown = (e) => {
      if ((e.key === "Enter" || e.key === " ") && !e.target.closest(".qtystep")) { e.preventDefault(); f.click(); }
    });
    qsa("#pick-grupos .qtyplus").forEach(b => b.onclick = (e) => {
      e.stopPropagation();
      const iid = b.closest(".qtystep").dataset.qty;
      cantidades.set(iid, Math.min((cantidades.get(iid) || 1) + 1, 99));
      drawInv(); calc();
    });
    qsa("#pick-grupos .qtyminus").forEach(b => b.onclick = (e) => {
      e.stopPropagation();
      const iid = b.closest(".qtystep").dataset.qty;
      const n = (cantidades.get(iid) || 1) - 1;
      if (n < 1) { picked.delete(iid); cantidades.delete(iid); }
      else cantidades.set(iid, n);
      drawInv(); calc();
    });
    /* plegar/desplegar solo mueve el bloque: no toca la selección */
    qsa("#pick-grupos .pk-cab").forEach(b => b.onclick = () => {
      const clave = b.dataset.pkToggle;
      if (plegadas.has(clave)) plegadas.delete(clave); else plegadas.add(clave);
      const abierto = !plegadas.has(clave);
      b.setAttribute("aria-expanded", String(abierto));
      b.closest(".pk-grupo").classList.toggle("plegada", !abierto);
      const cuerpo = b.closest(".pk-grupo").querySelector(".pk-cuerpo");
      if (cuerpo) cuerpo.hidden = !abierto;
    });
  };

  qs("#pick-buscar").oninput = (e) => {
    buscar = e.target.value;
    drawInv();
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
  /* con el cliente ya escrito, «Cancelar» es descartar: pregunta directo en vez de
     sumar una confirmación encima de otra */
  qs("#cancelar").onclick = async () => {
    if (!(await puedeSalir())) return;
    cerrarHoja();
  };

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
    picked.forEach(iid => { const p = productos().find(x => x.id === iid); if (p) items.push({ productoId: p.id, nombre: p.name, precio: Number(p.price) || 0, foto: p.photo, categoria: p.cat, qty: cantidades.get(iid) || 1 }); });
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
