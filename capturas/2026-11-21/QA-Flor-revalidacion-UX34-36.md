# Revalidación UX34–36 — Flor (QA funcional) · 21-nov-2026

## Base y alcance
- SHA publicado revalidado: `0ebd670` (incluye fotos demo `c85dadd` + barra auto-ocultable `27d345c`/`0ebd670`).
- Vivo byte-idéntico verificado: SHA-256 `src/main.js` = `c9d31382bffb73fe8e9cf0b5e2a08db22993a04e9b1e0ca766abbf8cbd7660d0` y `sw.js` = `df58a671e4a569dd0ede42010f3fe7b6907827c469e73b1db4591be669bcf6f7` (local = publicado). Caché `ropa-v2-nav-fotos-r7`.
- Fuente: `PLAN.md` secciones P1–P3 y "Pendientes UX34 reobservados" (copia del estado v1 `cd851c7`). Informes base: `QA-Orion-UX35-cd851c7.md`, `Revision-Bianca-UX36.md`, revisión 20-nov task_b732978120564726.
- Sin BD, sin cotejo de config, sin tocar fotos/barra, sin cambio de código, sin push/publicación.

## Checks ejecutados
| Comando | Resultado |
|---|---|
| `npm test` (sobre worktree temporal en `0ebd670`) | 69/69 PASS, exit 0 |
| `npm run check` | OK, 52 archivos, exit 0 |
| Consola del vivo `?demo=1` | 0 errores; 1 warning preexistente (meta apple-mobile-web-app-capable deprecated) |
| Diff de los 2 commits nuevos | Solo fotos-demo / nav-scroll + tests/docs; ningún fix UX34–36 revertido |

## Matriz funcional

| Hallazgo | Estado | Evidencia reproducible |
|---|---|---|
| UX36-01 · P1 monetarios | **NO VIGENTE** | `src/nucleo/moneda.js`: gramática estricta (`NUMERO`) + `esPrecioValido`; `pantalla-pedido-editor.js:157-165` e `inventario-editor.js:61-67` validan al Guardar con `mostrarError` (aria-invalid + `.ferr` + foco, sin mutar). Probe directo: `abc`, `-10`, `1e3`, `1.2.3`, `12..00`, `12.3456`, `..`, `1,2,3` → null/rechazados; `0` preservado; `12.50` → 12.5. Ya no aparece `ReferenceError: d is not defined`. |
| UX36-02 · P2 snapshot de foto | **NO VIGENTE** | `entidades.js:itemDesdeProducto` copia `foto` del producto; `store.js:crearPedido` reconstruye cada ítem desde `productoPorId` (foto real almacenada). Test `store.test.mjs:109` "borrar producto conserva el pedido con su snapshot" PASS. Detalle (`pantalla-pedido-detalle.js:32-38`) usa `i.foto ?? i.photo`, con fallback compatible. |
| UX36-03 · P2 textos largos en Detalle | **NO VIGENTE** | `base.css:56` `.contenedor-texto{min-width:0;overflow-wrap:anywhere}`; `componentes.css:475` `.dcard-txt min-width:0`; `.dnombre` line-clamp 2 + `overflow-wrap:anywhere`. En vivo a 320px, inyecté cliente de 63 chars y producto de 71 chars en la hoja de detalle: `h2.scrollWidth=252=clientWidth`, `dnWrap=anywhere`, sheet `scrollWidth=clientWidth=288`, documento `scrollWidth=clientWidth=305` → sin desborde. |
| UX36-04 · P2 accesibilidad teclado | **NO VIGENTE** | En vivo: 5 cards de pedido, 30 días de calendario y 4 contactos con `role=button tabindex=0 onkeydown` (Enter/Espacio, `preventDefault`). Cards del detalle son `<button>` reales. Focus + Enter sobre card abrió la hoja (`#hoja.className = "hoja abierta"`). Sin botones anidados. |
| UX35-05 residual · label Categoría | **NO VIGENTE** | `pantalla-inventario-editor.js:87-90`: `<fieldset class=campo-seg><legend>Tipo de prenda</legend><div id=seg-cat role=group aria-label="Tipo de prenda">`. No queda `label for=inv-cat` colgante. |
| UX36-05 · P3 feedback/área táctil foto | **NO VIGENTE** | `componentes.css:522-525` `.prow .quitar` y botones de foto `min-width/min-height:44px`; `.mpic.tiene` con tinte; `inv-photo-del` aparece al adjuntar y la preview muestra la miniatura. Grilla 3× intacta. |

## UX34 residuales (PLAN.md §"Pendientes UX34 reobservados")
Mejoras funcionales still en su lugar: hoja con `role=dialog`, foco inicial en `h2`, Escape cierra,入口 Nuevo pedido con CTA, "Pendientes de cobro" / "Ver todos los pedidos", "Días con entregas", confirmación `alertdialog` con Cancelar y variante neutral (`cbtn-yes neutral`).

Quedan **3 residuos de copy/CTA menores, preexistentes** (no son regresión de fotos ni de barra, no fueron tocados por los commits revisados):
1. UX34-13: ficha de cliente muestra "Pendientes (n)" / "Hechos (n)" en vez de "Pendientes de pago / Pagados" — `pantalla-cliente.js:89-91`.
2. UX34-14: la confirmación de cambio de estado es neutral y tiene Cancelar, pero el botón dice "Cambiar estado" en vez de "Marcar como pagado" — `pantalla-pedido-detalle.js:102`.
3. UX34-10: estados vacíos de búsqueda dicen "Sin resultados" pero no ofrecen botón Limpiar/Ver todos — `pantalla-pedidos.js:45`.

Son P3; no bloquean la revalidación. Se propone task separada para cerrar UX34 por completo.

## Veredicto
**APPROVED** para la revalidación UX34–36 sobre `0ebd670`: ninguno de los hallazgos P1/P2/P3 volvió a estar vigente. Las fotos demo y la barra auto-ocultable no introdujeron regresiones funcionales en estas áreas. Chrome del proyecto suelto (dejado en about:blank). Worktree temporal de solo lectura removido. Preparación 5/5.
