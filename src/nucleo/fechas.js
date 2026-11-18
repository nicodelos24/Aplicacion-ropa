// fechas.js — utilidades puras de fecha (día como "AAAA-MM-DD" string)
import { MESES } from "./moneda.js";
export const DOW = ["D", "L", "M", "M", "J", "V", "S"];
export const DSEM = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];

export function dstr(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

export function hoy() { return dstr(new Date()); }

export function desplazarDias(n) {
  const x = new Date();
  x.setDate(x.getDate() + n);
  return dstr(x);
}

/** "2026-11-24" → "24 de noviembre" (con año si no es el actual). */
export function fdate(s) {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return d + " de " + MESES[+m - 1] + (+y !== new Date().getFullYear() ? " de " + y : "");
}

/** "2026-11-24" → "24 nov 26" (solo con año si no es el actual). */
export function fdateShort(s) {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return +d + " " + MESES[+m - 1].slice(0, 3) + (+y !== new Date().getFullYear() ? " " + String(y).slice(2) : "");
}

export function esHoy(s) { return s === hoy(); }

export function esPasado(s) { return s < hoy(); }

/** Celdas de un mes: {ds, dia, enMes, esHoy, esPasado} para la agenda. */
export function celdasMes(anio, mes) {
  const primero = new Date(anio, mes, 1);
  const dias = new Date(anio, mes + 1, 0).getDate();
  const hueco = primero.getDay();
  const celdas = [];
  for (let i = 0; i < hueco; i++) celdas.push(null);
  for (let d = 1; d <= dias; d++) {
    const ds = dstr(new Date(anio, mes, d));
    celdas.push({ ds, dia: d, enMes: true, esHoy: esHoy(ds), esPasado: esPasado(ds) });
  }
  return celdas;
}

export function sumarMes(anio, mes, delta) {
  let m = mes + delta, a = anio;
  if (m < 0) { m = 11; a--; }
  if (m > 11) { m = 0; a++; }
  return { anio: a, mes: m };
}
