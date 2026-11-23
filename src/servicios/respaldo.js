// Respaldo JSON: exportar descargable e importar validado (sin ejecutar nada).
// La confirmación la maneja la UI vía el callback `confirmar`.
import { exportar, importar } from "../estado/store.js";
import { dstr } from "../nucleo/index.js";

export function nombreArchivo() {
  return "respaldo-ropa-" + dstr(new Date()) + ".json";
}

export function descargarRespaldo() {
  if (typeof document === "undefined") return { ok: false, error: "Sin DOM" };
  const blob = new Blob([exportar()], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nombreArchivo();
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 500);
  return { ok: true };
}

/** Lee el File y lo importa; devuelve {ok, counts} o {ok:false, error}. */
export function importarRespaldo(file, { confirmar } = {}) {
  return new Promise((resolve) => {
    if (!file) { resolve({ ok: false, error: "Sin archivo" }); return; }
    const r = new FileReader();
    r.onload = () => resolve(importar(String(r.result), { confirmar }));
    r.onerror = () => resolve({ ok: false, error: "No se pudo leer el archivo" });
    r.readAsText(file);
  });
}

/** Conteo de un respaldo sin importarlo (para la hoja de confirmación). */
export function inspeccionar(json) {
  try {
    const d = JSON.parse(json);
    const arr = (v) => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object") : []);
    return {
      ok: Array.isArray(d.orders) && (arr(d.orders).length || arr(d.inventory).length || arr(d.clients).length),
      counts: { orders: arr(d.orders).length, inventory: arr(d.inventory).length, clients: arr(d.clients).length },
    };
  } catch { return { ok: false, counts: null }; }
}
