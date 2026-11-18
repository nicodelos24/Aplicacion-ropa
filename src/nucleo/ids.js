// ids.js — identificadores únicos (referencias entre entidades SIEMPRE por id)
let seq = 0;
export function uid(prefijo = "id") {
  seq = (seq + 1) % 1000;
  return `${prefijo}_${Date.now().toString(36)}${seq.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
