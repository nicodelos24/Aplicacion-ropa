# QA final · «Nuevo producto» desde el detalle del pedido (Ropa V2)

- **Rama:** `feat/pedido-alta-producto` @ `b62f84d9fd5e6ef9841e3ab75aa172c850080698` — worktree `.worktrees/pedido-alta-producto`, status limpio.
- **Revisado:** `src/estado/store.js`, `src/nucleo/pedidos.js`, `src/pantallas/pantalla-pedido-detalle.js`, `src/pantallas/pantalla-pedido-nuevo-producto.js`, `tests/ui.test.mjs`.
- **Fecha:** 23/11/2026 · **QA:** Flor · datos solo de demo (`?demo=1`), sin datos de clientas reales ni secretos.

## Veredicto

**Sin hallazgos contra el cambio.** Todos los casos pedidos pasan en pantalla y en tests. No se corrigió código.

## Checks

| Comando | Resultado |
| --- | --- |
| `npm test` | **212/212 pass**, 0 fail, 0 cancelled/skipped/todo (38.0 s). Incluye los 3 tests nuevos: «Nuevo producto» sin foto + avatar por categoría, con foto, y cierre sin guardar con aviso. |
| `npm run check` | **Sintaxis OK: 69 archivos** (`src/**`, `sw.js`, `tests/*.test.mjs`). |

## Casos probados en pantalla (Chrome del proyecto, `kaia_chrome_ropaapp`)

Servidor local `python3 -m http.server 8740` sobre el worktree; demo `http://127.0.0.1:8740/index.html?demo=1`.

| Caso | Resultado | Evidencia |
| --- | --- | --- |
| Alta **sin foto**, categoría «Abrigo / Chaqueta», precio `890,50` | OK. Total del pedido $1,200 → **$2,090.50**; contador de inventario 6 → 7; toast «Camisola QA sin foto agregado al pedido · $890.50». | `03`, `02` |
| Avatar SVG por categoría en la tarjeta sin foto | OK. La tarjeta tiene `<svg>` con el ícono de abrigo, **no** tiene `<img>`; coincide con la categoría elegida. | `03` |
| Alta **con foto** (galería, image/jpeg), precio `345,75` | OK. Previa con `<img>` y botón «Quitar» visible al elegir; tras guardar, foto `data:image/...` en producto **y** en el ítem del pedido; la tarjeta muestra `<img>` y **no** `<svg>`. Total $1,545.75. | `04`, `05`, `08` |
| Precio con decimales | OK. `890,50` → `890.50` y `345,75` → `345.75` en `localStorage` (producto `price` e ítem `precio`); el total usa el mismo valor. | `03`, `05` |
| Producto en pedido **y** inventario | OK. `d.inventory` crece a 7; el pedido de Rosita pasa de 1 a 2 ítems; el ítem nuevo lleva `productoId` del producto recién creado, `qty: 1`. Escritura atómica confirmada por el test de disco que falla. | inspección de `localStorage` |
| Persistencia (`suscribirDisco`) | OK. Justo tras guardar, `localStorage.ropa_v2_data` ya contiene producto e ítem; al navegar **sin** resembrar demo (URL sin `?demo=1`) el producto, el precio decimal y el ítem siguen ahí. **Aclaración:** recargar con `?demo=1` vuelve a sembrar los datos demo (`main.js` → `boot(datosDemo())` → `persistencia.guardar`), así que el alta se pierde *por diseño del modo demo*, no por el cambio. La persistencia real se validó sin resembrar. | inspección de `localStorage` |
| Errores de consola | **0 errores** en toda la sesión. Hay 1 warning preexistente y ajeno al cambio: `<meta name="apple-mobile-web-app-capable"> is deprecated`, de `index.html:0`. | `browser_console_messages` |
| Validación (extra) | Nombre vacío → «Escribí el nombre del producto»; precio `0` → «El precio debe ser mayor a $0»; hoja sigue abierta y **no** se crea producto. | inspección de DOM + `localStorage` |
| Cerrar sin guardar (extra) | Cubierto por test automatizado; en pantalla el botón «Cancelar» cierra la hoja sin cambios. | tests + `09` |

## Revisión visual (misma pasada)

- **390 px**, claro y oscuro: hoja legible, sin desbordes, campos y botones completos. `09` (claro), `01`/`02` (oscuro), `08`/`03`/`05` (detalle).
- **320 px**, oscuro: sin overflow horizontal (`scrollWidth 305 < innerWidth 320`), hoja scrollea y los campos siguen accesibles. `06`, `07`.
- **Touch targets ≥ 44 px**: `dItemNuevoBtn` 52, `dItemEditarBtn` 52, `hEdit`/`hClose` 44, `dCerrar` 52; en la hoja `camBtn`/`photoBtn` 48, `np-name`/`np-price` 50, `np-save`/`np-cancelar` 52, categorías 44. Todos OK a 390 y 320.
- Observación cosmética (no bloqueante, decide Amber/Dino): la categoría por defecto «Accesorio / Otro» abre con el halo de foco verde marcado. Es el foco estándar del navegador, no un error funcional ni de estilo del cambio.

## Capturas

Todas en `capturas/2026-11-24/` dentro del worktree. Los nombres `-claro`/`-oscuro` reflejan el tema real (corregí los nombres de las primeras tomas, que heredaron tema oscuro).

- `nuevo-producto-01-hoja-vacia-390-oscuro.png`
- `nuevo-producto-02-hoja-llena-sin-foto-390-oscuro.png`
- `nuevo-producto-03-detalle-sin-foto-avatar-390-oscuro.png`
- `nuevo-producto-04-hoja-con-foto-390-oscuro.png`
- `nuevo-producto-05-detalle-con-foto-390-oscuro.png`
- `nuevo-producto-06-hoja-320-oscuro.png`
- `nuevo-producto-07-detalle-320-oscuro.png`
- `nuevo-producto-08-detalle-claro-390-real.png`
- `nuevo-producto-09-hoja-vacia-claro-390-real.png`

## Fuera del alcance

- No se hicieron push, publicación ni cambios en `master`, Firebase ni BD.
- El warning del `<meta>` es preexistente en `index.html`; si se quiere arreglar, va en ficha aparte (no es hallazgo de este cambio).

## Chrome

Tomado y soltado en esta pasada: pestaña devuelta a `about:blank`, servidor HTTP 8740 detenido. Quien siga puede usarlo.
