// ayuda.js — burbuja de ayuda contextual «?». Mantiene la explicación disponible
// sin que ocupe espacio ni haga ruido: un botón 32×32 con aria-expanded y un
// globo que se abre al tocar (y se cierra al tocar fuera o con Escape).
// Es información, no una acción: por eso no interrumpe ni absorbe el foco.
import { ICONO } from "../iconos.js";
import { esc } from "../dom.js";

/** @param {string} texto.Texto de ayuda (se escapa). @param {string} [etiqueta] aria-label del botón. */
export function ayudaHTML(texto, etiqueta = "Ver ayuda") {
  return `<span class="ayuda-q">
    <button type="button" class="ayuda-q-btn" aria-label="${esc(etiqueta)}" aria-expanded="false">?</button>
    <span class="ayuda-q-globo" role="note" hidden>${esc(texto)}</span>
  </span>`;
}

/** Cablea todas las burbujas de un contenedor; idempotente. */
export function cablearAyudas(raiz = document) {
  const burbujas = [...raiz.querySelectorAll(".ayuda-q")];
  if (!burbujas.length) return;
  const cerrar = (excepto) => burbujas.forEach(b => {
    if (b === excepto) return;
    b.classList.remove("abierta");
    b.querySelector(".ayuda-q-btn").setAttribute("aria-expanded", "false");
    b.querySelector(".ayuda-q-globo").hidden = true;
  });
  burbujas.forEach(b => {
    if (b.dataset.cableada) return;
    b.dataset.cableada = "1";
    const btn = b.querySelector(".ayuda-q-btn");
    const globo = b.querySelector(".ayuda-q-globo");
    btn.onclick = (e) => {
      e.stopPropagation();
      const abre = !b.classList.contains("abierta");
      cerrar(b);
      b.classList.toggle("abierta", abre);
      btn.setAttribute("aria-expanded", String(abre));
      globo.hidden = !abre;
    };
  });
  if (!raiz.dataset.ayudasCableadas) {
    raiz.dataset.ayudasCableadas = "1";
    document.addEventListener("click", (e) => { if (!e.target.closest(".ayuda-q")) cerrar(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrar(); });
  }
}
