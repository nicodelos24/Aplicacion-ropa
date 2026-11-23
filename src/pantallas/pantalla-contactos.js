// pantalla-contactos.js — lista con avatar, resumen pendientes/hechos, puntos de estado, WhatsApp, notas.
import { esc, qsa } from "../ui/dom.js";
import { ICONO, VACIO_SVG } from "../ui/iconos.js";
import { fmtTel, resumenCliente } from "../nucleo/contacto.js";
import { estadoDe } from "../nucleo/pedidos.js";
import { db, clientes, pedidos } from "../estado/store.js";
import { vista } from "../estado/vista.js";
import { abrirHojaCliente } from "./pantalla-cliente.js";
import { abrirWhatsApp } from "../servicios/whatsapp.js";
import { abrirEditorCliente } from "./pantalla-cliente-editor.js";
import { pintarStats } from "./pantalla-pedidos.js";

export function pintarContactos(main) {
  const d = db();
  const lista = clientes().filter(c =>
    !vista.busqueda || c.name.toLowerCase().includes(vista.busqueda.toLowerCase()) || (c.tel || "").includes(vista.busqueda));
  pintarStats([{ b: d.clients.length, s: "Clientes" }]);

  if (!lista.length) {
    main.innerHTML = vista.busqueda
      ? `<div class="vacio anim-entra"><div class="viso">${VACIO_SVG.buscar}</div><b>Sin resultados</b><p>Nadie coincide con “${esc(vista.busqueda)}”. Probá con otro nombre o teléfono.</p></div>`
      : `<div class="vacio anim-entra"><div class="viso">${VACIO_SVG.contactos}</div><b>Aún no hay clientes</b><p>Se guardan automáticamente al registrar un pedido.<br>También podés agregarlos desde acá.</p><button class="btn btn-primario btn-vacio" data-acc="nuevo">Nuevo cliente</button></div>`;
  } else {
    main.innerHTML = `<div class="stagger pantalla-grilla grilla-cli">${lista.map(c => {
      const r = resumenCliente(pedidos(), c.id);
      const dots = r.pedidos.slice(0, 8).map(o => `<span class="cdot d-${estadoDe(o).c}" title="${estadoDe(o).l}"></span>`).join("");
      return `<div class="cli" data-id="${c.id}" role="button" tabindex="0" aria-label="Ver ${esc(c.name)}">
        <div class="card-fila">
          <div class="cli-id">
            <div class="avatar">${esc((c.name || "?")[0].toUpperCase())}</div>
            <div class="contenedor-texto">
              <h3 class="contenedor-texto">${esc(c.name)}</h3>
              <p>${r.texto}${c.tel ? `<br><span class="cli-tel">${ICONO.tel} ${esc(fmtTel(c.tel, d.prefijo))}</span>` : ""}${c.notas ? `<div class="cli-nota">${esc(c.notas)}</div>` : ""}</p>
              ${r.pedidos.length ? `<div class="cdots">${dots}</div>` : ""}
            </div>
          </div>
          <button class="cli-wa ${c.tel ? "" : "none"}" aria-label="${c.tel ? "Escribir por WhatsApp a " + esc(c.name) : "Agregar WhatsApp a " + esc(c.name)}">${c.tel ? ICONO.wa : "Sin<br>WA"}</button>
        </div>
      </div>`;
    }).join("")}</div>`;

    qsa(".cli", main).forEach(cardEl => {
      cardEl.onclick = e => { if (e.target.closest(".cli-wa")) return; abrirHojaCliente(cardEl.dataset.id); };
      cardEl.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirHojaCliente(cardEl.dataset.id); } };
      const w = cardEl.querySelector(".cli-wa");
      w.onclick = e => {
        e.stopPropagation();
        const c = clientes().find(x => x.id === cardEl.dataset.id);
        if (!c) return;
        if (c.tel) abrirWhatsApp(c.tel, "", d.prefijo);
        else abrirEditorCliente(c);
      };
    });
  }
  main.querySelectorAll("[data-acc='nuevo']").forEach(b => b.onclick = () => abrirEditorCliente(null));
}
