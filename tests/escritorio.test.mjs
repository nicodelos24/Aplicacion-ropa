// tests/escritorio.test.mjs — aprovechar el ancho en computadora (>=1024 px) sin
// tocar el layout de celular. Los anchos reales se verifican en el navegador
// (capturas dino- en capturas/2026-11-23/); acá se fija lo que no debe volver atrás:
// los breakpoints existen, suman columnas donde suman y el orden de las reglas
// deja ganar a las de escritorio (misma especificidad, la última manda).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const leer = (rel) => fs.readFileSync(path.join(RAIZ, rel), "utf8");
const CSS = leer("src/ui/componentes/componentes.css");
const BASE = leer("src/ui/base.css");

/** El bloque completo del @media cuyo encabezado coincide. */
function bloqueMedia(css, encabezado) {
  const i = css.indexOf(encabezado);
  if (i < 0) return null;
  const abre = css.indexOf("{", i);
  let nivel = 0;
  for (let j = abre; j < css.length; j++) {
    if (css[j] === "{") nivel++;
    else if (css[j] === "}") {
      nivel--;
      if (nivel === 0) return css.slice(abre + 1, j);
    }
  }
  return null;
}

const ESCRITORIO = "@media (min-width:1024px){";
const escritorio = bloqueMedia(CSS, ESCRITORIO);

test("el celular no cambia: main sigue en 560 px por defecto y la barra inferior igual", () => {
  assert.match(BASE, /main\{\s*padding:18px 16px 0;\s*max-width:560px;/, "base de celular intacta");
  assert.match(CSS, /@media \(max-width:560px\)\{[\s\S]*?\.inv\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/, "inventario a 2 columnas en celular");
  assert.match(CSS, /@media \(max-width:360px\)\{/, "reglas de pantallas compactas intactas");
  /* la nav auto-ocultable no se reemplaza por menú lateral */
  assert.doesNotMatch(escritorio || "", /nav\s*\{[^}]*position:(static|relative)/, "la nav sigue fija abajo en escritorio");
  assert.doesNotMatch(CSS, /nav\.lateral|menu-lateral/, "sin menú lateral");
});

test("desde 1024 px el ancho útil sube de 560 a 1200 px", () => {
  assert.ok(escritorio, "existe el bloque de escritorio");
  assert.match(escritorio, /^[\s\S]*main\{max-width:1200px;/, "main más ancho");
  assert.match(escritorio, /\.topbar > \*\{max-width:1200px;/, "header alineado al mismo ancho");
});

test("listas y grillas aprovechan el ancho: pedidos 2, contactos 3, historial 2, inventario 5", () => {
  assert.ok(escritorio);
  assert.match(escritorio, /\.grilla-cards\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/, "pedidos en dos columnas");
  assert.match(escritorio, /\.grilla-cli\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)\}/, "contactos en tres columnas");
  assert.match(escritorio, /\.grilla-ev\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/, "historial en dos columnas");
  assert.match(escritorio, /\.inv\{grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/, "inventario a cinco por fila");
});

test("inicio y agenda se reparten en dos columnas (dinero | agenda y cobros; calendario | entregas)", () => {
  assert.ok(escritorio);
  assert.match(escritorio, /#main:has\(\.moneycard\)\{[\s\S]*?grid-template-columns:minmax\(0,1\.15fr\) minmax\(0,1fr\)/, "inicio en dos columnas");
  assert.match(escritorio, /#main:has\(\.moneycard\) > \.moneycard,[\s\S]*?grid-column:1/, "el dinero queda a la izquierda");
  assert.match(escritorio, /#main:has\(\.agenda-switch\) > \.cal\{grid-column:1; grid-row:2\}/, "calendario a la izquierda");
  assert.match(escritorio, /#main:has\(\.agenda-switch\) > \.card\{grid-column:2/, "entregas del día a la derecha");
});

test("las pantallas marcan sus grillas y las de escritorio vienen después de las de celular", () => {
  assert.match(leer("src/pantallas/pantalla-pedidos.js"), /class="stagger pantalla-grilla grilla-cards"/);
  assert.match(leer("src/pantallas/pantalla-contactos.js"), /class="stagger pantalla-grilla grilla-cli"/);
  assert.match(leer("src/pantallas/pantalla-historial.js"), /class="stagger pantalla-grilla grilla-ev"/);
  assert.match(leer("src/pantallas/pantalla-inicio.js"), /class="stagger grilla-cards"/);
  /* dentro de un @media la especificidad no cambia: el bloque de escritorio tiene
     que ir después de los de celular para ganarle a .inv de 2 columnas */
  assert.ok(CSS.indexOf(ESCRITORIO) > CSS.indexOf("@media (max-width:560px){"), "orden: escritorio al final");
  /* el bloque <=360 no se solapa con el de 1024, así que su orden no importa */
  assert.ok(CSS.indexOf("@media (max-width:360px){") > CSS.indexOf("@media (max-width:560px){"), "móvil: 560 antes que 360");
});
