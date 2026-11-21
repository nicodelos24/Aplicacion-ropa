# Cierre de residuos UX34 (13, 14, 10) — verificación Amber · 21-nov-2026

## Base y alcance
- Rama: `fix/ux34-residuos`, worktree `.worktrees/ux34-residuos`, arrancada en el SHA publicado `0ebd670`.
- Commit del cambio: `503a7ab` (`fix(ux34): copys y CTA de pagos, búsqueda y hoja de cliente`). Sin push, sin publicación.
- Fuente del copy: `Revision-Bianca-UX36.md` §5 (UX34-10/13/14) e informe de Flor `QA-Flor-revalidacion-UX34-36.md`.
- Sin BD, sin cotejo de config, sin tocar fotos demo ni barra auto-ocultable, sin permisos/reglas.

## Los tres residuos

| ID | Antes | Ahora | Archivo | Evidencia |
|---|---|---|---|---|
| UX34-13 | `Pendientes (n)` / `Hechos (n)` | `Pendientes de pago (n)` / `Pagados (n)` | `src/pantallas/pantalla-cliente.js` (plantilla `HOJA`) | Test jsdom + captura `ux34-residuos-cliente.png` (ficha de Rosita) |
| UX34-14 | CTA `Cambiar estado` al pasar a Pagado | CTA `Marcar como pagado` solo si destino = `paid`; otros destinos siguen `Cambiar estado`; confirmación neutral + Cancelar intactos | `src/pantallas/pantalla-pedido-detalle.js` (~L102) | Test jsdom + captura `UX34-14-marcar-como-pagado.png` |
| UX34-10 | Vacío de búsqueda sin acción | Botón `Limpiar búsqueda` (`data-acc="limpiar"`) que limpia input, `vista.busqueda` y `vista.filtro`, y vuelve a la lista | `src/pantallas/pantalla-pedidos.js` (~L45) | Test jsdom + captura `UX34-10-limpiar-busqueda.png` |

## Verificación reproducible
- `npm test` sobre `503a7ab`: **70/70 PASS** (base `0ebd670`: 69/69; se agregó 1 test y se ajustaron 2).
- `npm run check`: **Sintaxis OK, 52 archivos**, exit 0.
- Navegador real (Chrome del proyecto, demo local `?demo=1`, sin Firebase):
  - UX34-10: buscar `zzz` → vacío con botón «Limpiar búsqueda»; al tocarlo, `#search.value === ""`, `vista.filtro === "all"`, vuelven los **5 pedidos**.
  - UX34-13: ficha de `dc1` (Rosita) → títulos `Pendientes de pago (1)` y `Pagados (1)`, sin copy viejo.
  - UX34-14: pedido `d1` → confirmación al destino `paid` con CTA «Marcar como pagado», clase `cbtn-yes neutral`, Cancelar presente; destino no-paid (`msg`) conserva «Cambiar estado».
  - Consola: 0 errores; 1 warning preexistente (`apple-mobile-web-app-capable` deprecated), no introducido por este cambio.
  - Chrome del proyecto **soltado** (quedó en `about:blank`); servidor local `python3 -m http.server` detenido.

## Diff
`git diff --stat 0ebd670..503a7ab`:
```
 capturas/2026-11-21/ux34-residuos-cliente.png | Bin 0 -> 73815 bytes
 src/pantallas/pantalla-cliente.js             |   4 ++--
 src/pantallas/pantalla-pedido-detalle.js      |   3 ++-
 src/pantallas/pantalla-pedidos.js             |   9 ++++++++-
 tests/ui.test.mjs                             |  25 ++++++++++++++++++++++---
 5 files changed, 34 insertions(+), 7 deletions(-)
```
Las 3 capturas nuevas de verificación (incluidas en este informe) se versionan en el mismo commit de evidencia.

## Estado
Listo para revisión/merge por Nico. **No publicar** sin OK expreso. Preparación 5/5.
