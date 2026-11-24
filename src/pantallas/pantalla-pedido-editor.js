// pantalla-pedido-editor.js — editor de pedido: cliente conocido, WhatsApp, productos del inventario o nuevos,
// cuotas 2–12 solo en "En cuotas", fecha de entrega, notas; los productos nuevos entran al inventario y al pedido.
// Nada se guarda sin «Guardar»: cerrar con ediciones pendientes avisa antes de perderlas.
// Fixes QA F0F1: precio 0 bloqueado (>0, P2) y cuotas fuera de rango con error inline, sin clamp silencioso (P3).
// Selector de productos (decisión Y, 23-nov): filas compactas dentro de cada sección, con badge
// «elegidos/total» en la cabecera plegable y buscador; filtrar nunca deselecciona ni cambia el total.
import { esc, qs, qsa } from "../ui/dom.js";
import { ICONO, svgCategoria } from "../ui/iconos.js";
import { fmt, parseMoneda, esPrecioValido } from "../nucleo/moneda.js";
import { esFotoDemo } from "../datos/fotos-demo.js";
import { ESTADOS, ORDEN_ESTADOS, CUOTAS_MIN, CUOTAS_MAX, cuotasValidas, qtyDe, subtotalItem, totalItems } from "../nucleo/pedidos.js";
import { maskTel } from "../nucleo/contacto.js";
import { CATEGORIA_DEFECTO } from "../nucleo/catalogo.js";
import { gruposParaElegir, hayResultados, contarElegidos } from "../nucleo/pedido-picker.js";
import { usosPorProducto } from "../nucleo/orden.js";
import {
  crearPedido, editarPedido, productos, clientes, db, secciones, pedidos,
} from "../estado/store.js";
import { abrirHoja, cerrarHoja, alCerrarHoja } from "../ui/componentes/hoja.js";
import { toast } from "../ui/componentes/toast.js";
import { mostrarError } from "../ui/componentes/campo.js";
import { confirmar } from "../ui/componentes/confirmar.js";
import { fotoPickerHTML, conectarFotoPicker } from "../ui/componentes/foto-picker.js";
import {
  camposArticuloHTML, conectarCamposArticulo, previaArticuloHTML, ICONOS_FOTO,
} from "../ui/componentes/campos-articulo.js";
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
  /* Snapshot del pedido por productoId: nombre, precio acordado, foto y tipo
     guardados en el momento de la venta. El inventario puede haber cambiado
     después; editar el pedido NO debe reprocesar esos precios. */
  const snapPorId = new Map();
  (orig?.items || []).forEach(i => {
    if (!i.productoId) return;
    qtyInicial.set(i.productoId, (qtyInicial.get(i.productoId) || 0) + qtyDe(i));
    if (!snapPorId.has(i.productoId)) snapPorId.set(i.productoId, {
      nombre: i.nombre ?? i.name ?? "", precio: Number(i.precio ?? i.price) || 0,
      foto: i.foto ?? i.photo ?? null, categoria: i.categoria || null,
    });
  });
  // selección actual: ids del inventario ya en el pedido (edición) o del preset
  const selInicial = new Set(qtyInicial.keys());
  const cantidades = new Map(qtyInicial); // copia de trabajo: el usuario puede cambiar la cantidad al editar
  const totalInicial = totalItems(orig?.items);

  abrirHoja(`<div class="agarre"></div><h2>${esNuevo ? (presetCliente ? `Nuevo pedido · ${esc(presetCliente.name)}` : "Nuevo pedido") : "Editar pedido"}</h2>
    <label class="campo"><span class="campo-label">Cliente</span><input id="f-cliente" value="${esc(base.cliente)}" placeholder="Nombre del cliente" list="clients-dl" autocomplete="off"></label>
    <datalist id="clients-dl">${cls.map(c => `<option value="${esc(c.name)}">`).join("")}</datalist>
    <div id="client-hint"></div>
    <label class="campo"><span class="campo-label">WhatsApp (opcional) · prefijo ${esc(db().prefijo || "+598")} se agrega solo</span><input id="f-tel" value="${esc(base.tel || "")}" inputmode="tel" placeholder="099 123 123"></label>
    <span class="campo-label campo-label-solo">Productos</span>
    <div class="seg seg-modo" id="mode-seg" role="group" aria-label="Modo de productos">
      <button data-m="inv" class="on">Del inventario</button>
      <button data-m="man">Nuevo producto</button>
    </div>
    <div id="mode-inv">
      <div class="picker-buscar">
        <span class="picker-lupa">${ICONO.buscar}</span>
        <input id="pick-buscar" type="search" placeholder="Buscar en el inventario…" aria-label="Buscar prenda en el inventario" autocomplete="off">
      </div>
      <div id="pick-grupos"></div>
    </div>
    <div id="mode-man" class="oculto">
      <p class="hint np-intro">Los productos nuevos se guardan en el inventario y quedan agregados a este pedido.</p>
      <div id="plist"></div>
      <button class="addp" id="addp">${ICONO.plus} Nuevo producto</button>
      <div class="np-form oculto" id="np-form">
        <div class="np-form-cab">
          <b>Datos del producto</b>
          <button type="button" class="btn-mini" id="np-cerrar" aria-label="Cerrar formulario de producto">${ICONO.x}</button>
        </div>
        <div id="np-prev"></div>
        ${fotoPickerHTML({ camara: "np-cam", galeria: "np-photo" })}
        <div class="foto-acciones">
          <button class="btn btn-ghost" id="np-camBtn">${ICONOS_FOTO.camara} Tomar foto</button>
          <button class="btn btn-ghost" id="np-photoBtn">${ICONOS_FOTO.imagen} Galería</button>
          <button class="btn btn-ghost oculto" id="np-photo-del">${ICONOS_FOTO.basura} Quitar</button>
        </div>
        ${camposArticuloHTML({ prefijo: "np", nombre: "", precio: "", cat: CATEGORIA_DEFECTO })}
        <button class="btn btn-primario" id="np-agregar">Agregar al pedido</button>
      </div>
    </div>
    <div class="totalbar"><span id="ftotal-lbl">Total</span><b id="ftotal" class="monto">${fmt(totalInicial)}</b></div>
    ${base.estado === "paid"
      ? `<label class="campo campo-est"><span class="campo-label">Estado</span>
           <p class="hint hint-ok">${ESTADOS.paid.l} · para deshacer el pago, cambialo desde el detalle del pedido.</p>
         </label>`
      : `<label class="campo campo-est"><span class="campo-label">Estado</span>
      <div class="seg" id="seg-est" role="group" aria-label="Elegir estado">
        ${ORDEN_ESTADOS.map(k => `<button data-k="${k}" class="${base.estado === k ? "on " + ({ paid: "s-green", msg: "s-orange", due: "s-blue" }[k] || "") : ""}" aria-pressed="${base.estado === k}">${ESTADOS[k].l}</button>`).join("")}
      </div></label>`}
    <div id="cuotas-wrap" class="${base.estado === "due" ? "" : "oculto"}">
      <label class="campo"><span class="campo-label">Número de cuotas (2–12)</span><input id="f-cuotas" type="number" min="2" max="12" value="${base.cuotas || CUOTAS_MIN}"></label>
    </div>
    <label class="campo"><span class="campo-label">Fecha de entrega / recordatorio (opcional)</span><input id="f-fecha" type="date" value="${base.fecha || ""}"></label>
    <label class="campo"><span class="campo-label">Notas (opcional)</span><textarea id="f-notas" rows="2" placeholder="Ej. Entregar el viernes">${esc(base.notas || "")}</textarea></label>
    <button class="btn btn-primario" id="saveBtn">${esNuevo ? "Guardar pedido" : "Guardar cambios"}</button>
    <button class="btn btn-ghost" id="cancelar">Cancelar</button>`);

  let estado = base.estado;
  const picked = new Set(selInicial);
  /* productos nuevos del pedido: se agregan desde el formulario «Nuevo producto»
     (con confirmación) y se guardan en inventario + pedido al tocar «Guardar». */
  let manuales = [];
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
      .map((i) => [i.nombre.trim(), i.precio, i.cat || CATEGORIA_DEFECTO, i.foto || ""]),
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
    /* el total del carrito lo calcula el núcleo (mismo motor que la tarjeta y el detalle) */
    const delInventario = [...picked]
      .map(iid => productos().find(x => x.id === iid))
      .filter(Boolean)
      .map(p => ({
        precio: snapPorId.has(p.id) ? snapPorId.get(p.id).precio : p.price,
        qty: cantidades.get(p.id) || 1,
      }));
    const aMano = manuales.map(i => ({ precio: parseMoneda(i.precio), qty: i.qty }));
    const t = totalItems([...delInventario, ...aMano]);
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
    /* La fila de un producto ya incluido en el pedido muestra su snapshot:
       precio/nombre/foto acordados, no los del inventario actual. */
    const snap = on ? snapPorId.get(p.id) : null;
    const nombre = snap ? snap.nombre : p.name;
    const precio = snap ? snap.precio : p.price;
    const foto = snap ? snap.foto : p.photo;
    const cat = snap ? snap.categoria : p.cat;
    const qty = on
      ? `<span class="fila-stepper qtystep" data-qty="${p.id}">
           <button type="button" class="qtyminus" aria-label="Restar ${esc(p.name)}">−</button>
           <b aria-label="Cantidad ${n}">${n}</b>
           <button type="button" class="qtyplus" aria-label="Sumar ${esc(p.name)}">+</button>
         </span>`
      : "";
    return `<div class="pk-fila${on ? " on" : ""}" data-iid="${p.id}" role="button" tabindex="0" aria-pressed="${on}">
      <span class="pk-mini">${foto ? `<img src="${esc(foto)}" alt="">` : svgCategoria(cat)}</span>
      <span class="pk-txt"><b>${esc(nombre)}</b><small>${fmt(precio)}</small></span>
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
    const grupos = gruposParaElegir(inv, secciones(), { buscar, elegidos: picked, usos, snapshots: snapPorId });
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

  /* Productos nuevos ya agregados: lista de solo lectura con su foto (o avatar
     por categoría), nombre, precio y un botón para quitarlos del pedido. */
  const drawMan = () => {
    const lista = qs("#plist");
    lista.innerHTML = manuales.length
      ? `<div class="np-lista">${manuales.map((it, i) => `
          <div class="np-item">
            <span class="pk-mini">${it.foto ? `<img src="${esc(it.foto)}" alt="">` : svgCategoria(it.categoria || CATEGORIA_DEFECTO)}</span>
            <span class="pk-txt"><b>${esc(it.nombre)}</b><small>${fmt(parseMoneda(it.precio) ?? 0)}</small></span>
            <button type="button" class="quitar" data-i="${i}" aria-label="Quitar ${esc(it.nombre)} del pedido">×</button>
          </div>`).join("")}</div>`
      : "";
    qsa(".np-item .quitar", lista).forEach(el => el.onclick = () => {
      manuales.splice(Number(el.dataset.i), 1);
      drawMan(); calc();
    });
  };

  /* Formulario «Nuevo producto»: se abre y se cierra sin tocar el pedido. Los
     campos son los compartidos con «Editar este artículo» (precio con decimales,
     cero bloqueado); la foto es opcional (avatar por categoría si no hay). */
  const npForm = qs("#np-form");
  const npCampos = conectarCamposArticulo({
    prefijo: "np", cat: CATEGORIA_DEFECTO, nombre: "", precio: "",
  });
  let npFoto = null;
  const pintarNPFoto = (d) => {
    npFoto = d || null;
    qs("#np-prev").innerHTML = previaArticuloHTML(npFoto);
    qs("#np-photo-del").classList.toggle("oculto", !npFoto);
  };
  pintarNPFoto(null);
  const npPicker = conectarFotoPicker({ camara: "np-cam", galeria: "np-photo", alElegir: pintarNPFoto });
  qs("#np-camBtn").onclick = () => npPicker.elegir();
  qs("#np-photoBtn").onclick = () => npPicker.galeria();
  qs("#np-photo-del").onclick = () => pintarNPFoto(null);

  const abrirNPForm = () => {
    npForm.classList.remove("oculto");
    qs("#np-name").focus({ preventScroll: true });
  };
  const cerrarNPForm = () => npForm.classList.add("oculto");
  qs("#addp").onclick = abrirNPForm;
  qs("#np-cerrar").onclick = cerrarNPForm;

  qs("#np-agregar").onclick = async () => {
    const leido = npCampos.leer();
    if (!leido.ok) return;
    const ok = await confirmar({
      title: "¿Agregar este producto?",
      msg: `“${leido.nombre}” (${fmt(leido.precio)}) se guardará en el inventario y quedará agregado al pedido de ${qs("#f-cliente").value.trim() || "este cliente"}.`,
      ok: "Guardar en inventario y pedido",
      danger: false,
    });
    if (!ok) return;
    manuales.push({ nombre: leido.nombre, precio: leido.textoPrecio, cat: leido.cat, foto: npFoto, qty: 1 });
    /* deja el formulario limpio y cerrado para el próximo producto */
    qs("#np-name").value = "";
    qs("#np-price").value = "";
    pintarNPFoto(null);
    cerrarNPForm();
    drawMan(); calc();
  };

  drawInv(); drawMan(); calc();
  qsa("#mode-seg button").forEach(x => x.classList.toggle("on", x.dataset.m === "inv"));
  qs("#mode-inv").classList.remove("oculto");
  qs("#mode-man").classList.add("oculto");

  qsa("#mode-seg button").forEach(b => b.onclick = () => {
    qsa("#mode-seg button").forEach(x => x.classList.toggle("on", x === b));
    qs("#mode-inv").classList.toggle("oculto", b.dataset.m !== "inv");
    qs("#mode-man").classList.toggle("oculto", b.dataset.m !== "man");
    if (b.dataset.m !== "man") cerrarNPForm();
    calc();
  });
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
    /* Los productos nuevos ya vienen validados del formulario; se revisa igual
       antes de escribir para no guardar nunca un precio inválido o $0. */
    for (const i of manuales) {
      if (!esPrecioValido(i.precio) || (parseMoneda(i.precio) ?? 0) <= 0) {
        mostrarError(qs("#saveBtn"), "Hay un precio inválido en los productos nuevos");
        toast("Precio inválido en un producto", "warn");
        return;
      }
    }
    const items = [];
    /* Productos del inventario: se toma SOLO la existencia del producto; nombre/
       precio/foto/categoría vienen del snapshot del pedido (precio acordado),
       salvo que «Editar este artículo» ya haya actualizado ese snapshot. */
    picked.forEach(iid => {
      const p = productos().find(x => x.id === iid);
      if (!p) return;
      const snap = snapPorId.get(iid);
      const base = snap
        ? { productoId: p.id, nombre: snap.nombre, precio: snap.precio, foto: snap.foto, categoria: snap.categoria, qty: cantidades.get(iid) || 1 }
        : { productoId: p.id, nombre: p.name, precio: Number(p.price) || 0, foto: p.photo, categoria: p.cat, qty: cantidades.get(iid) || 1 };
      /* Las fotos de muestra se superponen solo en la lectura (store.db());
         jamás se guardan como propias al editar el pedido. */
      items.push(esFotoDemo(base.foto) ? { ...base, foto: null } : base);
    });
    /* «Nuevo producto»: entra con la categoría elegida (o la por defecto) y se
       vincula al inventario en un solo write desde store.js. */
    manuales.forEach(i => items.push({
      productoId: null, nombre: i.nombre.trim(), precio: parseMoneda(i.precio) ?? 0,
      foto: i.foto, categoria: i.cat || CATEGORIA_DEFECTO, qty: 1,
    }));
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
