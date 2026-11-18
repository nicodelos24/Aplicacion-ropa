// confirmar.js — confirmación neutral accesible (foco atrapado, Escape, click afuera = No).
import { qs } from "../dom.js";
import { ICONO } from "../iconos.js";

const cov = () => qs("#confirmar");

export function confirmar(o) {
  return new Promise(res => {
    const c = cov();
    const danger = o.danger === undefined ? true : !!o.danger;
    qs(".cic", c).className = "cic " + (danger ? "danger" : "info");
    qs(".cic", c).innerHTML = ICONO.alert;
    qs("#cv-t", c).textContent = o.title;
    qs("#cv-p", c).textContent = o.msg || "";
    const si = qs("#cv-yes", c), no = qs("#cv-no", c);
    si.textContent = o.ok || "Aceptar";
    si.className = "cbtn-yes" + (danger ? "" : " neutral");

    const trigger = document.activeElement;
    const fondo = [qs("#main"), qs("#hoja"), qs("nav")].filter(Boolean);
    fondo.forEach(el => (el.inert = true));
    c.classList.add("abierta");

    let listo = false;
    const done = v => {
      if (listo) return; listo = true;
      c.classList.remove("abierta");
      document.removeEventListener("keydown", onKey);
      fondo.forEach(el => (el.inert = false));
      if (trigger && trigger.focus) try { trigger.focus(); } catch {}
      no.onclick = si.onclick = c.onclick = null;
      res(v);
    };
    no.onclick = () => done(false);
    si.onclick = () => done(true);
    c.onclick = e => { if (e.target === c) done(false); };
    const onKey = e => {
      if (e.key === "Escape") done(false);
      else if (e.key === "Tab") {
        const f = [no, si];
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[1].focus(); }
        else if (!e.shiftKey && (i < 0 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    (o.focusNo === undefined ? danger : o.focusNo) ? no.focus() : si.focus();
  });
}
