// pantalla-ajustes.js — tema, prefijo, respaldo, datos demo; cuenta y negocios quedan para F4.
import { esc, qs } from "../ui/dom.js";
import { ICONO } from "../ui/iconos.js";
import { fmtTel } from "../nucleo/contacto.js";
import { setPrefijo, setTema, borrarDatos, exportar, db, restaurarDemo } from "../estado/store.js";
import { toast } from "../ui/componentes/toast.js";
import { confirmar } from "../ui/componentes/confirmar.js";
import { nombreArchivo } from "../servicios/respaldo.js";

export function aplicarTema() {
  const t = db().theme || "dark";
  document.documentElement.dataset.theme = t;
  const btn = qs("#themeBtn");
  if (btn) btn.innerHTML = t === "dark" ? ICONO.moon : ICONO.sun;
}

export function pintarAjustes(main) {
  const d = db();
  const esOscuro = (d.theme || "dark") === "dark";
  main.innerHTML = `
    <div class="anim-entra">
    <div class="sett-card"><h3><span class="sic sic-cal">${ICONO.moon}</span> Apariencia</h3>
      <button class="btn btn-ghost sett-btn" id="tema-btn">${ICONO.sun} Cambiar a modo ${esOscuro ? "claro" : "oscuro"}</button>
    </div>
    <div class="sett-card"><h3><span class="sic sic-acc">${ICONO.check}</span> Prefijo de país</h3>
      <p>Se agrega automáticamente a los números de WhatsApp que no lo traigan. Ej: ${esc(d.prefijo || "+598")} (Uruguay).</p>
      <input id="prefijo-in" value="${esc(d.prefijo || "+598")}" class="sett-input" placeholder="+598" inputmode="tel">
      <button class="btn btn-ghost sett-btn sett-btn-sub" id="prefijo-save">Guardar prefijo</button>
    </div>
    <div class="sett-card"><h3><span class="sic sic-cal">${ICONO.download}</span> Respaldo</h3>
      <p>Guardá una copia de pedidos, inventario, clientes y agenda en un archivo.</p>
      <button class="btn btn-primario sett-btn" id="exp-btn">${ICONO.download} Descargar respaldo</button>
    </div>
    <div class="sett-card"><h3><span class="sic sic-clock">${ICONO.flask}</span> Datos de demo</h3>
      <p>${d.demo ? "Estás navegando con datos de demostración." : "Estás navegando con datos locales de este dispositivo."} Los demás modos llegan en las próximas fases.</p>
      ${d.demo ? `<button class="btn btn-ghost danger" id="reset-btn">${ICONO.espejo} Restaurar demo</button>` : ""}
    </div>
    <p class="sett-pie">Ropa v2 · Rediseño visual</p>
    </div>`;

  qs("#tema-btn").onclick = () => {
    const nuevo = esOscuro ? "light" : "dark";
    setTema(nuevo);
    aplicarTema();
    pintarAjustes(main);
  };
  qs("#prefijo-save").onclick = () => {
    const v = qs("#prefijo-in").value.trim();
    if (!/^\+\d{1,4}$/.test(v)) { toast("Prefijo inválido: debe empezar con + (ej. +598)", "warn"); return; }
    setPrefijo(v);
    toast("Prefijo guardado");
  };
  qs("#exp-btn").onclick = () => {
    const blob = new Blob([exportar()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nombreArchivo();
    a.click();
    toast("Respaldo descargado");
  };
  if (qs("#reset-btn")) qs("#reset-btn").onclick = async () => {
    if (!(await confirmar({ title: "¿Restaurar datos de demo?", msg: "Vuelve al conjunto de datos de demostración original.", ok: "Restaurar" }))) return;
    const r = restaurarDemo();
    if (r.persistencia.ok) toast("Demo restaurado");
    /* si el disco rechazó la escritura, `set()` ya dejó el estado intacto y
       avisó por el canal central: acá no decimos que se restauró. */
  };
}
