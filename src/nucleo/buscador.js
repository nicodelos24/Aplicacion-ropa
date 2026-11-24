// buscador.js — filtro compartido por sección (búsqueda 90/no-match del QA v1).
// Texto listo para comparar: minúsculas, espacios recortados y sin tildes.
export function normalizar(s) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

import { nombreItem } from "./pedidos.js";
export function coincidePedido(o, q) {
  const n = normalizar(q);
  if (!n) return true;
  return normalizar(o.cliente).includes(n)
    || (o.items || []).some(i => normalizar(nombreItem(i)).includes(n));
}

export function coincideProducto(i, q) {
  const n = normalizar(q);
  if (!n) return true;
  return normalizar(i.name).includes(n);
}

export function coincideCliente(c, q) {
  const n = normalizar(q);
  if (!n) return true;
  return normalizar(c.name).includes(n) || (c.tel || "").includes(n);
}
