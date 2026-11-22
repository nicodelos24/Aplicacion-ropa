# Índice compartido de capturas — Ropa

Este archivo es el índice único para capturas de Nico, Alba, Bianca y Orion/QA. Las capturas que deban compartirse de forma duradera se guardan en `capturas/AAAA-MM-DD/` con nombres breves y descriptivos; se enlazan aquí con fecha, autor, pantalla/versión, motivo, evidencia relacionada y estado. No se incorporan imágenes de clientas ni datos reales sin autorización explícita.

## Cómo registrar una captura nueva

1. Guardar el original en `capturas/AAAA-MM-DD/` sin sobrescribir otros archivos.
2. Nombrar descriptivamente: `autor-pantalla-hallazgo.ext` (por ejemplo, `nico-detalle-pedido-cuotas.jpg`).
3. Agregar una fila abajo: fecha, quién la tomó, versión/commit o URL/demo si se conoce, descripción, enlace a archivo y task/recibo relacionado.
4. Para evidencia generada durante revisión o QA, indicar viewport/tema y vincular el informe/tarea; no dar por aprobada una ronda por adjuntar capturas.
5. Mantener este archivo y los registros/tareas como referencias; no mover ni borrar capturas históricas sin verificar sus enlaces.

## 2026-11-14 · Bianca · UX36 sobre cd851c7 — NO OK todavía

Nueva auditoría local terminada; no publicada. **[Informe UX36](Revision-Bianca-UX36.md)** · **[QA independiente de Orion](QA-Orion-UX35-cd851c7.md)** · [tarea](apx:tasks/task_4ed4698f7ca54723). Datos demo y foto sintética, no datos de clientas reales.

- **[Lámina resumen UX36](capturas/2026-11-14/ux36-bianca/bianca-ux36-resumen.png)**: error decimal sin mensaje, detalle largo desbordado y mismo pedido antes/después de borrar producto con foto de catálogo.
- [Carpeta UX36](capturas/2026-11-14/ux36-bianca/): **27 matrices fuente =162 combinaciones** de escena/ancho/tema, **8 capturas individuales**; los162 recortes PNG y las6 láminas JPG son derivados, no pruebas adicionales. Viewports320×568/393×740/1280×800, claro/oscuro; interacción independiente393×740.
- Matrices `home/agenda/orders/inventory/clients/history/settings` (cada nombre seguido de `-matriz.png`); formularios `newproduct/newcontact/neworder/neworder-bottom/editorder/detail`; vacíos `empty-*`; adversos `longdetail/longproduct-detail/photo-row/sixdetail/stateconfirm/agenda-selected/search90/search-none`.
- Individuales: `keyboard-background.png`, `decimal-sin-mensaje.png`, `invalido-cero.png`, `foto-quitar-editor.png`, `foto-catalogo-antes.png`, `foto-catalogo-despues.png`, `cliente-hechos.png`, `lightbox.png`. Snapshot `keyboard-listas.yml`. Todas en la carpeta UX36.
- No usar imágenes UX35 de0bc1a40 como evidencia de cd851c7. La suite23/23 no cierra los casos negativos de dinero; informe/recibo de Alba explican qué pasa y qué sigue abierto.

## Capturas registradas

| Fecha | Autor | Versión / contexto | Descripción | Archivo / evidencia | Estado |
|---|---|---|---|---|---|
| 2026-11-13 | Nico | Ropa v29 publicada según aviso recibido; el commit/versión exacta de la captura no está identificado aquí | Detalle de pedido en móvil: imagen ampliada sin un cierre suficientemente visible; chips de estado casi ilegibles; controles −/+ de cuota con baja visibilidad; botones de editar/borrar quedan ocultos por las tarjetas superpuestas. | [Captura original](capturas/2026-11-13/nico-detalle-pedido-estado-cuotas-superposicion.jpg) · [Tarea de corrección visual](apx:tasks/task_081ef3e96ee94aec) | Corregida y verificada en local por Bianca; sin publicar. Ver evidencia v30 abajo. |
| 2026-11-13 | Bianca | v23 / BV-13, revisión visual | Lámina y matrices visuales de la revisión v23, con veredicto NO OK y hallazgos R23-01–06. Evidencia permanece adjunta a la tarea; no se duplicó localmente al crear el índice. | [Evidencia adjunta a tarea](apx:tasks/task_611c67d04f724048) | No aprobación; historial referenciado |
| 2026-11-13 | Bianca | Corrección puntual de v29 → v30 local | Cuatro puntos de Nico implementados y verificados en demo; originales y lámina indexados abajo. La revisión general v24–v28 (`task_e7f969b9ca404a41`) no se cierra por este trabajo. | [Tarea](apx:tasks/task_081ef3e96ee94aec) · [Informe](Revision-Bianca-UX35.md) | OK visual local para este alcance; sin publicar |

## Evidencia de Bianca · corrección v29 · 2026-11-13

Tarea común: [task_081ef3e96ee94aec](apx:tasks/task_081ef3e96ee94aec). Base `eaaaf40`/cache v29; corrección **local, sin publicar**, rama `fix/visual-v29`, commit `66541f5`, cache preparada v30. Datos demo y fotos SVG sintéticas, no clientas reales. Viewports de navegador, no teléfono físico. Matriz adicional 360×800 medida sin captura propia. Detalle de pruebas/contrastes en [Revision-Bianca-UX35](Revision-Bianca-UX35.md).

| Autor / fecha | Contexto y pantalla | Captura | Estado / motivo |
|---|---|---|---|
| Bianca · 13/11 | v29 publicada · claro · 393×800 | [Antes: estados y cuotas](capturas/2026-11-13/bianca-v29-antes-claro-393.png) | Reproducción de bajo contraste; referencia histórica, no corrección |
| Bianca · 13/11 | v30 local · lámina con tres capturas originales 393×800 | [Resumen visual](capturas/2026-11-13/bianca-v30-resumen-visual.png) | Claro, oscuro y cierre explícito de foto; montaje documental, no pantalla nueva |
| Bianca · 13/11 | v30 local · pedido · claro · 320×800 | [Pedido claro 320](capturas/2026-11-13/bianca-v30-light-320-pedido.png) | Estados/cuotas/acciones visibles y última tarjeta fija al frente |
| Bianca · 13/11 | v30 local · pedido · oscuro · 320×800 | [Pedido oscuro 320](capturas/2026-11-13/bianca-v30-dark-320-pedido.png) | Misma comprobación, oscuro |
| Bianca · 13/11 | v30 local · pedido · claro · 393×800 | [Pedido claro 393](capturas/2026-11-13/bianca-v30-light-393-pedido.png) | Legibilidad y selección sin desplazarse |
| Bianca · 13/11 | v30 local · pedido · oscuro · 393×800 | [Pedido oscuro 393](capturas/2026-11-13/bianca-v30-dark-393-pedido.png) | Legibilidad y selección sin desplazarse |
| Bianca · 13/11 | v30 local · pedido · claro · 1280×900 | [Pedido claro escritorio](capturas/2026-11-13/bianca-v30-light-1280-pedido.png) | Hoja limitada y acciones accesibles |
| Bianca · 13/11 | v30 local · pedido · oscuro · 1280×900 | [Pedido oscuro escritorio](capturas/2026-11-13/bianca-v30-dark-1280-pedido.png) | Hoja limitada y acciones accesibles |
| Bianca · 13/11 | v30 local · foto ampliada desde inventario · 393×800 | [Cierre de imagen en inventario](capturas/2026-11-13/bianca-v30-lightbox-inventario-393.png) | Botón × Cerrar, fuera de la foto y de 44px |
| Bianca · 13/11 | v30 local · segundo toque del producto del pedido · 393×800 | [Foto del pedido](capturas/2026-11-13/bianca-v30-lightbox-pedido-393.png) | Misma capa y cierre; no elimina otras tarjetas |
| Bianca · 13/11 | v30 local · editar desde barra superior · 393×800 | [Editar abre](capturas/2026-11-13/bianca-v30-editar-pedido-393.png) | Formulario real tras tocar Editar con tarjeta seleccionada |
| Bianca · 13/11 | v30 local · eliminar desde barra superior · 393×800 | [Confirmación de eliminar](capturas/2026-11-13/bianca-v30-eliminar-cancelar-393.png) | Eliminar abre su confirmación; Cancelar conservó el pedido de prueba |
| Bianca · 13/11 | v30 local · seis productos/nombres largos · 320×568 | [Acciones tras scroll](capturas/2026-11-13/bianca-v30-320-scroll-tarjetas.png) | Barra sticky por encima de tarjetas, sin overflow |
| Bianca · 13/11 | v30 local · pedido oscuro · 320×568 | [Hoja en viewport corto](capturas/2026-11-13/bianca-v30-dark-320-corto.png) | Verificación complementaria en alto reducido |

## QA independiente de Orion · corrección v29 · 2026-11-13

- [Informe completo y referencias a snapshots](capturas/2026-11-13/orion-v30-qa.md), tarea `task_081ef3e96ee94aec`, commit `66541f5`, demo local, sesión `review-visual-v29`.
- **APPROVED sólo en los flujos ejecutados:** cuotas, estados rápidos, editar y eliminar/cancelar/confirmar con última tarjeta seleccionada; claro/oscuro. Sin fallos encontrados. No aprobación integral: lightbox, móvil y mediciones no pudieron instrumentarse en su sesión read-only; las comprobaciones de Bianca están separadas arriba.
- El informe registra los snapshots APX `8580208363054229514.1.8–.1.30` y los jobs de comprobación. No se afirma que esos snapshots sean archivos PNG locales; no se recibió una captura de imagen nueva de Orion para copiar en esta ronda.

## Correcciones de auditoría v32 · Alba · 2026-11-14

- [Informe local v33 y referencias a snapshots APX](capturas/2026-11-14/alba-v33-verificacion.md), commit `26fcf3c`, rama `fix/visual-v32`, worktree `.worktrees/fix-visual-v32`.
- Demo real en iframe 320/393/1280 claro/oscuro: **145/145 comprobaciones OK**, 0 errores JS capturados; 12/12 pruebas Node. Imágenes de Ajustes, detalle, editor y foto vistas en la sesión; no se exportaron PNG nuevos. Sin integrar/publicar.

## Revisión UX/UI v33 para mejoras v34 · Bianca · 2026-11-14

- Base: `3e48d0d`, demo pública `?demo=1`, caché `ropa-v33`. **43 capturas**, con siete vistas principales en claro/oscuro a 320/393/1280 y pruebas focales de altas, detalles, total mixto, validación, búsqueda y vacíos.
- [Índice de los 43 archivos, cobertura y límites](capturas/2026-11-14/ux-v33-indice.md) · [Hallazgos y prioridades en Revision-Bianca-UX35](Revision-Bianca-UX35.md) · [Tarea](apx:tasks/task_13ee081695514dfb).
- **Hallazgos y propuestas, no aprobación de v34.** No se modificó ni publicó la app. Datos demo e imagen sintética. Detalle de cuatro productos repetido aquí solo oscuro 320; demás cruces y límites físicos/funcionales explícitos en el subíndice. La revisión incluye capturas adicionales conservadas tras un reinicio de APX; no se repitió una evaluación cuyo permiso no llegó a tiempo.

## Alcance del índice

Este índice centraliza el material desde su adopción y enlaza evidencia histórica que sigue en tareas APX/recibos. Es posible que capturas antiguas aún no estén copiadas a `capturas/`; sus ubicaciones se agregan a medida que cada agente las identifica, sin afirmar que el repositorio ya contiene todo el archivo histórico.

## Segunda revisión extensa UX35 · Bianca · 2026-11-14

- [Informe completo](Revision-Bianca-UX35.md) · [QA funcional independiente de Orion](QA-Orion-UX35.md).
- [Lámina de hallazgos](capturas/2026-11-14/extensa-bianca/bianca-ux35-resumen.png).
- Matrices visuales: [320](capturas/2026-11-14/extensa-bianca/coverage-320.jpg) · [393](capturas/2026-11-14/extensa-bianca/coverage-393.jpg) · [1280](capturas/2026-11-14/extensa-bianca/coverage-1280.jpg).
- [Carpeta con 153 PNG y mosaicos](capturas/2026-11-14/extensa-bianca/): `<vista>-<tema>-<ancho>` = base; `sheet-*` = hojas, top/bottom; `empty-*` = vacíos; `long-*` = estrés; cámaras y hallazgos con nombres descriptivos. Incluye un PNG de fixture sintético, no sólo screenshots.
- Base local `0bc1a40`, publicación aún v33. NO OK por 9 hallazgos recién detectados; 4 datos/fotos confirmados por Orion y heredados. Cámara corregida OK. No teléfono/nube/lector completo. Sin código ni publicación.

## Ropa v2 · F0+F1 · Blas + Olga · 2026-11-18

- Base: worktree `.worktrees/f0-f1-visual`, rama `feat/f0-f1-visual` (commit `b23ce11` + segunda tanda). App navegando con datos demo (`index.html?demo=1`).
- **39 capturas** en `capturas/2026-11-18/`: `qa-*.png` y `*-det*.png` (QA Blas), `rev-*.png` (recorrido de Olga, 3 sesiones), `rev3-*.png` (ronda final: tema claro en 7 vistas, verificación de correcciones).
- [Informe con hallazgos y veredicto](Revision-Olga-F0F1.md) · [Tarea](apx:tasks/task_53820456ff864518).
- Correcciones aplicadas: moneda con decimales, truncado/superposición en inventario, `.cli-wa.none` claro, contraste `.cdot`, **persistencia de tema** (bug real), precache del SW, fechas "19 nov", aria duplicado del editor. Readiness 4/5.

## Ropa v2 · QA F0+F1 · Flor + fixes de Dino · 2026-11-18

- Base: commit `be8a545` (fixes) en `feat/f0-f1-visual`, worktree `.worktrees/f0-f1-visual`. [Informe QA](QA-Flor-F0F1.md).
- Correcciones de los 3 hallazgos (P2 precio $0, P3 clamp de cuotas, P3 categoría default): error inline "El precio debe ser mayor a $0" unificado en pedido editor e inventario; cuotas fuera de 2–12 con error "Entre 2 y 12 cuotas" sin clamp silencioso; productos a mano con "Accesorio / Otro" (👜) y selector enfocado en el alta.
- Capturas en `capturas/2026-11-18/qa-flor/fixes/`: [precio 0 bloqueado](capturas/2026-11-18/qa-flor/fixes/01-fix-precio-0-error.png) · [cuotas rechazadas](capturas/2026-11-18/qa-flor/fixes/02-fix-cuotas-error-inline.png) · [inventario con Otro](capturas/2026-11-18/qa-flor/fixes/03-fix-categoria-otro-inventario.png) · [alta con Otro + foco](capturas/2026-11-18/qa-flor/fixes/04-fix-categoria-default-foco.png).
- Verificado en Chrome (`index.html?demo=1`, origen limpio, 0 errores de consola); `npm test` en `.worktrees/v2-nucleo` 39/39. Commits `be8a545` + `34ab448`.

## Ropa v2 · REDESIGN TOTAL · Blas · 2026-11-18

- Base: worktree `.worktrees/f0-f1-visual`, rama `feat/redesign-v2`. Rediseño estético completo solicitado por Nico ("casera/parcheada" → profesional/moderno con dopamina visual).
- Tokens nuevos (`src/ui/tokens.css`): escala tipográfica, paleta 1 color marca + neutrales, sombras escalonadas, motion con spring; `prefers-reduced-motion` respetado. Íconos: set SVG inline propio en `src/ui/iconos.js` (cero emojis de texto suelto en las 7 secciones, verificado por DOM).
- **36 capturas** en `capturas/2026-11-18/redesign/`: `rd-<vista>.png` por sección (dark/light), `rd-editor-*` y `rd-*err` (validaciones QA conservadas), `rd-celebracion.png` (momento de pedido pagado).
- Capturas clave: [inicio dark](capturas/2026-11-18/redesign/rd-inicio-dark-top.png) · [pedidos con filtro](capturas/2026-11-18/redesign/rd-pedidos-filtro.png) · [detalle pedido](capturas/2026-11-18/redesign/rd-detalle-final.png) · [cuotas rechazadas](capturas/2026-11-18/redesign/rd-editor-cuotas-err.png) · [celebración pagado](capturas/2026-11-18/redesign/rd-celebracion.png) · [agenda con plegado](capturas/2026-11-18/redesign/rd-agenda-fold.png) · [ajustes dark](capturas/2026-11-18/redesign/rd-ajustes-dark.png) · [inicio light](capturas/2026-11-18/redesign/rd-inicio-light.png).
- Verificado en Chrome (`index.html?demo=1`): navegación 7 secciones, filtros de chips, editor pedido/producto/cliente con errores inline, celebración de pago, tema claro/dark persistente, 0 errores de consola.

## Rediseño total (dopamina visual) · Blas + Echo · 2026-11-18

- Pedido de Nico: rediseño estético total — sombras, jerarquía, animación, íconos SVG, sin emojis.
- Base: worktree `.worktrees/redesign-total`, rama `feat/redesign-total` (desde `35cb938`), app con datos demo (`index.html?demo=1`).
- [Brief de rediseño](BRIEF-REDESIGN.md): diagnóstico y dirección de diseño.
- **11 capturas** en `capturas/2026-11-18/` con prefijo `red-`: Inicio, Pedidos, Inventario, Contactos, Ajustes, Agenda, Historial y detalle de pedido (oscuro y claro) + verificación de chips de filtro en claro.
- Verificación: Inicio con moneycard protagonista y contadores animados, nav con píldora activa, halo de fondo, chips de estado con contraste ≥6.4:1, inventario a 2 columnas en móvil (≤560px). `node --check` OK en todo `src/`. Los tests `ui.test.cjs` y `check-syntax.cjs` son de v1 y fallan igual en la base (preexistentes).

## Abanico de tarjetas en detalle de pedido · Dino · 2026-11-19

- Base: worktree `.worktrees/abanico-detalle`, rama `feat/abanico-detalle` desde master `8cee94f`. Sin commit ni push (pendiente de OK de Nico).
- 18 capturas en `capturas/2026-11-19/abanico/` con 2/3/4 productos × 320/393/1280 × claro/oscuro, tarjeta del medio seleccionada. Ejemplos: [3 productos 320 dark](capturas/2026-11-19/abanico/abanico-3prod-320-dark.png) · [3 productos 393 light](capturas/2026-11-19/abanico/abanico-3prod-393-light.png) · [4 productos 1280 dark](capturas/2026-11-19/abanico/abanico-4prod-1280-dark.png).
- Abanico con rotación por índice (≤7°, 4 y 6+ productos más cerrado), tarjeta seleccionada +14px de alto y -14px de elevación, fondo con tinte de acento y halo; teclado y doble tap intactos. Medición con `getBoundingClientRect`, sin solape con título/ayuda y sin overflow horizontal en ninguna combinación.
- Fix de opacidad: el gradiente de `.dcard.sel` pasó de `var(--card2) → var(--acc-soft)` (translúcido) a `var(--card2) → color-mix(in srgb, var(--card2) 88%, var(--acc))` (alfa 1 en ambos temas); así el texto de las tarjetas de atrás ya no se filtra a través de la seleccionada.
- Segundo fix (texto colgante): con una tarjeta seleccionada, `.dcards:has(.dcard.sel) .dcard:not(.sel) .dcard-txt` queda en `opacity:0` (transición `var(--t-med)`); las inactivas muestran sólo icono + borde y su texto reaparece al seleccionarlas. Verificado en las 18 combinaciones con `getComputedStyle().opacity`: 1 en la seleccionada y 0 en el resto; al recorrer las tres tarjetas el foco de opacidad sigue a la seleccionada. Capturas regeneradas el 2026-11-19; crops ampliados de 3prod-320-dark, 3prod-393-light y 4prod-320-dark sin “Precio unitario” cortado bajo la seleccionada.
- Desvíos de la propuesta de Blas: se acotó el offset y el ancho para que la tarjeta no se coma el texto a 320px (piso de 162px de contenido), se compensó la proyección horizontal de la rotación restando del ancho y se reservaron 26px extra en la altura del stack para la punta rotada.
- Verificado en Chromium local (`index.html`, datos demo inyectados en localStorage, 0 errores JS en las 18 combinaciones); `node --check` OK en todo `src/`. Tests v1 (`ui.test.cjs`, `check-syntax.cjs`) siguen fallando en la base, fuera de esta tarea.
## Ropa v2 · Recheck visual B1+B2 · Flor · 2026-11-19

- Base: worktree `.worktrees/pulido-p3`, rama `feat/pulido-p3` (desde `master` `8cee94f`). Served HTTP (`python3 -m http.server 8813`, `index.html` con datos locales inyectados sin coincidencia en `due`), **393px**, tema claro y oscuro. Sin commits ni push.
- **4 capturas** en `capturas/2026-11-19/pulido-p3/`: [filtro vacío dark](capturas/2026-11-19/pulido-p3/01-pedidos-filtro-vacio-dark.png) · [filtro vacío light](capturas/2026-11-19/pulido-p3/02-pedidos-filtro-vacio-light.png) · [ajustes light](capturas/2026-11-19/pulido-p3/03-ajustes-light.png) · [ajustes dark](capturas/2026-11-19/pulido-p3/04-ajustes-dark.png).
- Verificado: (B1) chip "En cuotas (0)" sin búsqueda → "No hay pedidos con este filtro" + cuerpo "No hay pedidos en “En cuotas”. Probá con otro filtro o registrá uno nuevo." + botón "Nuevo pedido", en dark y light; búsqueda sin coincidencia sigue "Sin resultados" + "Nada coincide con …" (no cae en copy de filtro). (B2) tarjeta Apariencia con 0 `<p>` (sin el mensaje duplicado), un solo botón con texto accesible "Cambiar a modo claro/oscuro" y SVG `aria-hidden="true"`; tarjeta "Datos de demo" con `<h3>` visible en ambos temas. 0 errores de consola (1 warning inofensivo de meta `apple-mobile-web-app-capable` deprecated, preexistente).
- Sin desviaciones: el copy y la accesibilidad coinciden con lo esperado; no hizo falta corregir nada adicional en la rama.

## Ropa v2 · Tema unificado (B3) · Flor · 2026-11-19

- Base: rama `feat/pulido-p3`, worktree `.worktrees/pulido-p3`. Served HTTP (`python3 -m http.server 8815`, `index.html`, 393px, claro y oscuro). Sin commits ni push.
- Fix: única fuente de verdad `db().theme` en `ropa_v2_data`. Quitadas todas las lecturas/escrituras de `localStorage["ropa_v2_tema"]` en `src/main.js` y `src/pantallas/pantalla-ajustes.js` (0 referencias en `src/`). `setTema()` sigue guardando en `ropa_v2_data` y notificando; `aplicarTema()` ahora lee `db().theme`. Copy de B2 y tarjeta "Datos de demo" conservados; botón accesible con SVG `aria-hidden="true"`.
- **4 capturas** en `capturas/2026-11-19/tema-unificado/`: [claro inicial](capturas/2026-11-19/tema-unificado/01-claro-inicial.png) · [oscuro Ajustes](capturas/2026-11-19/tema-unificado/02-oscuro-ajustes.png) · [oscuro tras reload](capturas/2026-11-19/tema-unificado/03-oscuro-tras-reload.png) · [claro tras reload](capturas/2026-11-19/tema-unificado/04-claro-tras-reload.png).
- Verificado click→click→reload en ambos sentidos: (a) dark → #themeBtn → light+sol → #tema-btn Ajustes → dark+luna → reload persiste dark; (b) light → #tema-btn → dark → #themeBtn → light → reload persiste light. `documentElement.dataset.theme === ropa_v2_data.theme` en todos los pasos; `ropa_v2_tema` nunca reaparece. Prueba de robustez: con `ropa_v2_tema=dark` residual inyectado y `data.theme=light`, reload respeta `light` (el valor viejo se ignora). 0 errores de consola (1 warning preexistente de meta deprecated). `node --check` OK en los 2 archivos tocados.

## Vistas previas aprobadas sueltas · Dino · 2026-11-19

- Tres capturas que quedaron sin versionar de la integración del 19-nov, con datos demo (Paco, María Fernanda y montos de ejemplo), sin datos de clientas reales ni secretos.
- **Abanico en la vista previa del detalle**: [abanico-carta-preview-vista-previa.png](capturas/2026-11-19/abanico-carta-preview-vista-previa.png).
- **Barra con etiquetas siempre visibles**: [390px](capturas/2026-11-19/nav-etiquetas-390.png) · [320px](capturas/2026-11-19/nav-etiquetas-320.png).

## Barra inferior con nombres de sección siempre visibles · Dino · 2026-11-19

- Propuesta visual de Blas APROBADA por Nico ("quedó bien la barra mostrando los nombres de las secciones"). Base: worktree `.worktrees/nav-etiquetas`, rama `feat/nav-etiquetas-siempre` desde master `148a27b`, commit `c15a8de`. Sin push (pendiente de OK de Nico). [Tarea](apx:tasks/task_56131fad0b1b43c0).
- **4 capturas** en `capturas/2026-11-19/`: [390 dark](capturas/2026-11-19/nav-etiquetas-390-dark.png) · [390 light](capturas/2026-11-19/nav-etiquetas-390-light.png) · [320 dark](capturas/2026-11-19/nav-etiquetas-320-dark.png) · [320 light](capturas/2026-11-19/nav-etiquetas-320-light.png). Served HTTP (`python3 -m http.server 8912`, `index.html?demo=1#inicio`), Chrome del proyecto en contexto aislado, 0 errores JS (1 warning preexistente de meta deprecated).
- Fix: las 7 etiquetas reales (Inicio/Agenda/Pedidos/Inventario/Contactos/Historial/Ajustes) se muestran siempre (ícono arriba + texto abajo). Se reemplazan —sin `!important`— las reglas que las ocultaban (`max-width:0; opacity:0`) y el `max-width` del activo (`56px` en ≤560px) que recortaba "Contactos". `≤560px` ya no fija font-size (hereda 9px); nuevo `@media (max-width:360px)` con `nav{left:4px;right:4px;padding:0}` y etiquetas a 8px. Barra intacta: 70px alto, radius 24, fondo translúcido, sombras; color de etiqueta activo heredado de `--acc-text` del tema (mint en dark, teal oscuro en light).
- Verificado con `getComputedStyle` en las 4 combinaciones: 7 etiquetas con `max-width:none / opacity:1 / white-space:nowrap`, 9px a 390 y 8px a 320, barra 70px/radius 24 (left 8px+padding 4px a 390; left 4px+padding 0 a 320), sin solape entre etiquetas (`getBoundingClientRect`: "Contactos" 44.9px en botón 49.9px a 390; "Inventario"/"Contactos" ~39–40px en botones 42.1px a 320). Color activo `rgb(95,242,219)` dark y `rgb(5,104,92)` light. `npm run check` OK (48 archivos) y `npm test` 51/51 en verde.

## Integración v2 final en vivo · Dino · 2026-11-19

- Master `148a27b` → integración de 4 ramas (`feat/nav-etiquetas-siempre` 426d48f, `feat/agenda-vista-semanas` 6c51f40, `feat/abanico-carta` 64eb2c6, `feat/glow-dark-off` eac49cb) en worktree `.worktrees/integracion-v2`, rama `integration/v2-final`, merge `b93b02d`. Conflicto resuelto en `tests/ui.test.mjs` conservando los 3 bloques de tests (Semanas + 2 de abanico). `npm test` 56/56 y `npm run check` OK (48 archivos). Push a master y Pages propagado: `master=origin=5678e1a`.
- Fix incluido `5678e1a`: subida de versión del caché del service worker (`ropa-v2-f0f1-r3` → `ropa-v2-integracion-v2final-r4`); sin él los visitantes con el SW viejo seguían viendo los assets anteriores y no veían ninguna de las 4 mejoras. Test de regresión agregado en `tests/ui.test.mjs`.
- **5 capturas del vivo** (`https://nicodelos24.github.io/Aplicacion-ropa/?demo=1`, viewport 390 css, Chrome del proyecto) en `capturas/2026-11-19/integracion-v2-vivo/`: [barra con nombres + Inicio claro](capturas/2026-11-19/integracion-v2-vivo/01-barra-inicio-light.png) · [Semanas día 20 elegido claro](capturas/2026-11-19/integracion-v2-vivo/02-semanas-dia-elegido-light.png) · [Semanas día 20 elegido oscuro](capturas/2026-11-19/integracion-v2-vivo/03-semanas-dia-elegido-dark.png) · [abanico + glow oscuro apagado](capturas/2026-11-19/integracion-v2-vivo/04-abanico-glow-dark.png) · [abanico claro](capturas/2026-11-19/integracion-v2-vivo/05-abanico-light.png). 0 errores de consola (1 warning preexistente de meta deprecated). Datos demo, no clientas reales.
- Verificado en vivo: 6 assets cambiados byte-a-byte (`sha256sum` local = vivo), switch Calendario↔Semanas presente, día 20 resaltado mostrando solo el pedido de María Fernanda (Abrigo largo), barra con las 7 etiquetas, abanico de 2 tarjetas en el detalle de Paco (Camisa blanca $950 + Corbata $300) sin neon en oscuro. Pendiente: aprobación final de Nico; NO se hizo el ajuste de tarjetas más cuadradas tipo carta (viene después).

## Nav inferior auto-ocultable · Dino · 2026-11-21

- Rama `feat/nav-auto-ocultable`, worktree temporal aislado, base master `6877204` + merge de `origin/master` `c85dadd` (fotos demo). Cache del service worker `ropa-v2-nav-fotos-r7` (integrado con la rama de fotos demo). Demo local (`?demo=1`), 390×844 CSS, Chrome del proyecto (`kaia_chrome_ropaapp`), sin datos de clientas reales.
- **[Nav visible a 390px](capturas/2026-11-21/nav-auto-ocultable-390.png)**: barra inferior con las 7 secciones y etiquetas, estado visible tras toque. Verificado además en vivo con `getComputedStyle`: oculta = `translateY(92px)` + `opacity:0` + `pointer-events:none` + `aria-hidden="true"` en 210ms; visible = `translateY(0)` + `opacity:1`.
- Comportamiento comprobado en navegador real a 390px: wheel/scroll abajo oculta pasado ~70px y 8px de umbral; scroll arriba y toque muestran; inactividad de 3s scrolleada oculta; abrir `#hoja` fuerza visible y el temporizador no la oculta; `main::after` reserva `nav-h + 30px` fijo (sin salto al ocultar); FAB sigue accesible. `prefers-reduced-motion` sin transición.
- Fix incluido: el evento `scroll` llega después del `wheel` y la ventana de gesto se borraba al consumir el recorrido, por lo que subir no reaparecía la barra; se mantiene la ventana de gesto y se quitó el reanclado prematuro. Test de regresión agregado.
- `npm test` 69/69 y `npm run check` OK (52 archivos). Tarea [task_ec0b56e97d054cd1](apx:tasks/task_ec0b56e97d054cd1).

## Fix animaciones: nav visible al ocultarse + velocidad · Dino · 2026-11-21

- Rama `fix/animaciones-nav-velocidad`, worktree `.worktrees/animaciones-nav-velocidad`, base `origin/master` `0ebd670`. Cache del service worker `ropa-v2-nav-fotos-r8`. Reporte de Nico 21-nov 21:49, diagnóstico con mediciones de Amber. Demo local (`?demo=1`), 390×844 CSS, Chrome del proyecto (`kaia_chrome_ropaapp`), 0 errores de consola (1 warning preexistente). Sin datos de clientas reales.
- **Causa 1**: `nav.oculta button{visibility:hidden}` cambiaba `visibility` en el mismo frame (no interpola), así que los íconos desaparecían de golpe aunque transform+opacity animaran 210ms. **Fix**: la nav base declara `visibility:visible` con `transition:visibility 0s`, y `.oculta button` usa `visibility:hidden` con `transition:visibility 0s linear var(--t-med)` (delay = duración del transform). Medido en vivo: a 60ms `opacity:0.42` + `translateY(53px)` con íconos `visible`; a 241ms (transform ya en 92px) pasan a `hidden`. Al volver a mostrar, `visible` vuelve en el mismo frame y se anima normal.
- **Causa 2**: apilamiento de duraciones — `.vista`/`.stagger` usaban `--t-slow:340ms` y delays 20→276ms (última tarjeta ~616ms), y `.hoja-in` 440ms. **Fix**: `--t-slow` 340→200ms, stagger 18ms por tarjeta con techo 120ms (delays 16/34/52/70/88/106/120ms), hoja 440→220ms. Medido en vivo: `--t-slow:200ms`, vista `0.2s`, primera tarjeta delay 16ms, hoja `hojaEntra 0.22s`.
- **3 capturas DESPUÉS** (390 css, local, fijando la animación con Web Animations API para el frame intermedio): [nav visible](capturas/2026-11-21/animaciones-01-nav-visible.png) · [nav a mitad del ocultado con íconos aún visibles](capturas/2026-11-21/animaciones-02-nav-ocultandose.png) · [pedido abierto (hoja a 220ms)](capturas/2026-11-21/animaciones-03-pedido-abierto.png).
- `npm test` 69/69 y `npm run check` OK (52 archivos). Sin tocar BD/Firebase ni artículos.

## Fix animaciones, 2da pasada: transición simétrica + quitar blur costoso · Dino · 2026-11-21

- Nico reportó (21-nov 22:16) que la transición de la barra seguía "un poco rota" al ocultar/reaparecer y lentitud en pedidos e inventario. Rama `fix/animaciones-nav-velocidad` (misma), desde `origin/master` `ff99532`. Cache del sw `ropa-v2-nav-fotos-r9`. Demo local (`?demo=1`), 390×844 CSS, Chrome del proyecto (`kaia_chrome_ropaapp`), 0 errores de consola (1 warning preexistente), sin datos reales.
- **Reproducción y medición**: trace rAF de la nav en la URL pública a 390px, scroll real abajo y arriba. Ocultar y reaparecer animaban con la misma curva ease-out de 210ms, pero el `visibility:hidden` con `transition-delay:210ms` del commit anterior creaba asimetría (íconos `hidden` al reaparecer hasta el final) y `pointer-events` saltaba de `none` a `auto` en el mismo frame. Sitio público medido con `navBlur: saturate(1.45) blur(22px)` y 5 capas de backdrop-filter activas; en inventario 10 botones `.inv-acciones` con `blur(10px)` y 5 fotos. Primer perfil (caché fría): 2 long animation frames de 97.9 y 85.2ms, 1 long task de 70ms, RecalcStyle 75→141ms, Layout 26→49ms. Con caché caliente los long frames no se repitieron de forma sostenida (A/B 0.1ms recalc en ambos) — el costo real es trabajo de paint por blur, no decode de fotos (las 5 fotos están `complete`, 480px naturales) ni re-render JS (ScriptDuration ~0ms).
- **Cambios**: (1) nav sin `backdrop-filter` ni reglas de `visibility`/delay — solo transform+opacidad con la MISMA curva en ida y vuelta; `aria-hidden` (en JS) + `pointer-events:none` mantienen accesibilidad y bloquean clics mientras oculta. Fondo opaco 92% equivalente. (2) botones de inventario sin `backdrop-filter:blur(10px)`, fondo `rgba(12,15,24,.9)` equivalente → 0 capas de blur en inventario (antes 10). (3) `render()` ya no fuerza reflow con `void main.offsetWidth`; usa cancelación de animaciones + flush de estilo (`getComputedStyle().animationName`).
- **Verificado tras el fix**: trace rAF en ambos sentidos con la misma curva simétrica y `visibility:visible` constante; 0 long frames en el perfil local; recalc 0.1ms, 8 layouts, nav sin blur y 0 capas de blur en inventario. Ajustes sigue arriba a la derecha, sin salto de layout, fotos y FAB intactos.
- **4 capturas DESPUÉS** (390 css, local, frame intermedio fijado con Web Animations API): [nav visible](capturas/2026-11-21/animaciones-v2-01-nav-visible.png) · [nav a mitad del ocultado](capturas/2026-11-21/animaciones-v2-02-nav-ocultandose.png) · [pedido abierto](capturas/2026-11-21/animaciones-v2-03-pedido-abierto.png) · [inventario sin blur en botones](capturas/2026-11-21/animaciones-v2-04-inventario.png).
- `npm test` 69/69 y `npm run check` OK (52 archivos). Sin tocar BD/Firebase ni artículos.

## Ropa v2 · Barra reaparece sola tras pausa · Dino · 2026-11-22

- Rama `fix/nav-reaparicion-pausa`, worktree `.worktrees/nav-reaparicion-pausa`, commit `a708176` (base `origin/master` `d1c40e3`). Caché del service worker `ropa-v2-nav-pausa-r10`. Servido local (`python3 -m http.server 8765`), Chrome del proyecto (`kaia_chrome_ropaapp`), 390 css, datos demo (`?demo=1`) y real sin flag, sin datos de clientas reales ni secretos. Sin push. [Tarea](apx:tasks/task_8433cb35c12b4897).
- **Comportamiento nuevo**: al bajar la barra se oculta igual que antes; si seguís bajando no rebota (un solo temporizador rearmado en cada gesto + memoria de última dirección); tras ~4,5 s quieto vuelve sola con la MISMA transición de 210 ms (`transform` + `opacidad`, sin blur/reflow) y se queda visible hasta un gesto nuevo; al subir o tocar sigue apareciendo al instante. Con capa abierta (hoja/modal/lightbox) no se oculta ni reaparece.
- **Verificado en navegador real**: las 7 secciones (Inicio, Agenda, Pedidos, Inventario, Contactos, Historial, Ajustes) en demo y en real sin flag; la barra oculta al bajar y vuelve a los ~4,5 s con `transform: translateY(0)` y `opacity:1` en todos los casos. 0 errores JS (1 warning preexistente de meta deprecated).
- **6 capturas** en `capturas/2026-11-22/`: [Inicio oculta](capturas/2026-11-22/inicio-nav-oculta.png) · [Inicio vuelve](capturas/2026-11-22/inicio-nav-vuelve.png) · [Pedidos oculta](capturas/2026-11-22/pedidos-nav-oculta.png) · [Pedidos vuelve](capturas/2026-11-22/pedidos-nav-vuelve.png) · [Inventario oculta](capturas/2026-11-22/inventario-nav-oculta.png) · [Inventario vuelve](capturas/2026-11-22/inventario-nav-vuelve.png). Todas con datos demo.
- `npm test` 69/69 y `npm run check` OK (52 archivos). Sin tocar Firebase/BD ni fotos demo en datos reales.

## Barra inferior: reaparece sola tras una pausa · Amber · 2026-11-22

- Pedido de Nico 22-nov. Rama `fix/nav-reaparicion-pausa` desde `origin/master` `d1c40e3`, publicada como `a708176`. Cache del service worker `ropa-v2-nav-pausa-r10`. Sin base de datos ni fotos nuevas en datos reales.
- Cambio visible: la barra baja al desplazarse hacia abajo, vuelve al subir o al tocar, y si queda oculta reaparece sola tras 4,5 s quietos con la misma transición de 210 ms. No vuelve a ocultarse hasta un gesto nuevo (sin oscilación). Los pasos pequeños de inercia al bajar rápido ya no revierten el ocultamiento (sin rebote).
- Verificado en la URL pública `https://nicodelos24.github.io/Aplicacion-ropa/?demo=1` a 390×844: oculta al bajar, sigue oculta a los 4 s, visible a los 5 s y sigue visible a los 8 s; 0 errores y 0 avisos de consola. Las 7 secciones measuren la misma transición (`0.21s, 0.21s`) y sin `backdrop-filter`, incluidas pedidos e inventario.
- **6 capturas** (390 css, demo local): [Inicio, barra oculta](capturas/2026-11-22/inicio-nav-oculta.png) · [Inicio, barra vuelve](capturas/2026-11-22/inicio-nav-vuelve.png) · [Pedidos, barra oculta](capturas/2026-11-22/pedidos-nav-oculta.png) · [Pedidos, barra vuelve](capturas/2026-11-22/pedidos-nav-vuelve.png) · [Inventario, barra oculta](capturas/2026-11-22/inventario-nav-oculta.png) · [Inventario, barra vuelve](capturas/2026-11-22/inventario-nav-vuelve.png).
- Pruebas: nuevos `tests/nav-scroll.test.mjs` y `tests/nav-reaparicion-ui.test.mjs` en verde; `npm run check` OK (53 archivos). Fallo preexistente y no relacionado: `agenda: alternador Calendario ↔ Semanas…` falla también en `origin/master` sin estos cambios (fechas de la demo; depende del día). Revisión de secretos y datos de clientas: sin hallazgos en el diff. Tarea `task_8433cb35c12b4897`.

## Barra inferior: reaparición a medio segundo · Amber · 2026-11-22

- Pedido de Nico 22-nov: la barra, al quedar oculta bajando, vuelve a aparecer sola tras 500 ms quietos (antes 4,5 s). Rama `fix/nav-reaparicion-500ms` desde `origin/master` `9ec2912`. Cache del service worker `ropa-v2-nav-pausa-r11`. Sin tocar base de datos, datos reales ni fotos.
- Se compararon 400, 500 y 600 ms en navegador real a 390×844: con 400 ms la vuelta se siente apurada casi un parpadeo; con 600 ms se nota la espera; 500 ms resultó intencional y parejo. Medición con 500 ms: oculta al bajar en ~150 ms, empieza a volver a los ~500 ms y termina a ~700 ms con la MISMA curva de 210 ms; 0 errores y 0 avisos de consola.
- Verificado en las 7 secciones (Inicio, Agenda, Pedidos, Inventario, Contactos, Historial, Ajustes) con demo y sin flag: todas ocultan al bajar, vuelven tras la pausa, no oscilan y mantienen `transition 0.21s` sin `backdrop-filter`. Seguir bajando con eventos seguidos no rebota.
- **4 capturas** (390 css, local): [Inicio, barra oculta](capturas/2026-11-22/nav-500ms-inicio-oculta.png) · [Inicio, barra vuelve](capturas/2026-11-22/nav-500ms-inicio-vuelve.png) · [Pedidos, barra oculta](capturas/2026-11-22/nav-500ms-pedidos-oculta.png) · [Pedidos, barra vuelve](capturas/2026-11-22/nav-500ms-pedidos-vuelve.png).
- Pruebas: 9/9 en `tests/nav-scroll.test.mjs` y `tests/nav-reaparicion-ui.test.mjs`; `npm run check` OK (53 archivos). Fallo preexistente no relacionado: `agenda: alternador Calendario ↔ Semanas…` también falla en `origin/master` sin este cambio (depende de la fecha). Sin secretos ni datos de clientas en el diff.

## Ropa v2 · editor de pedido conserva la cantidad · Dino · 2026-11-22

- Rama `fix/pedido-cantidad-editor`, worktree `.worktrees/pedido-cantidad-editor`, base `bdcf046`. Caché del service worker `ropa-v2-pedido-cantidad-r14`. Hallazgo de Flor en la ronda «romper y pulir»; tarea [task_cea18e6f02ca4602](apx:tasks/task_cea18e6f02ca4602). Regla aplicada: opción A (preservar cantidad, sin tocar datos históricos del demo) mientras Nico no elija la B.
- **Causa**: el editor reconstruía el total sumando `price` sin `qty` y el store no normalizaba los ítems al guardar, así que editar el pedido de Rosita (2× Medias lanas $250, total $500) mostraba $250 y al guardar bajaba el total a $250.
- **Fix**: `pantalla-pedido-editor.js` lee `qty` de cada ítem del snapshot (sumando homónimos), muestra un stepper −/+ por producto y calcula con cantidad; `store.js` conserva los ítems originales si el llamador no los manda y normaliza `qty >= 1` al editar. Sin push; revisión visual final de Flor: **PASA**.
- **2 capturas de Flor** en `capturas/2026-11-22/`: [Editor de Rosita con Cantidad 2](capturas/2026-11-22/flor-importe-editor-rosita-editor-qty2.png) · [Guardado: Rosita conserva $500](capturas/2026-11-22/flor-importe-editor-rosita-guardado-500.png). Datos demo, sin clientas reales. Reemplazan al par `flor-importe-editor-antes/despues.png`, que mostraba Lucía/$1,400 y era engañoso.
- Verificado en pantalla por Flor en la revisión final: el editor abre con Cantidad 2 y Total $500, guardar conserva $500 y la tarjeta sigue legible a 320 px. `npm test` 75/75 y `npm run check` OK (53 archivos), incluidas dos pruebas de regresión nuevas en `tests/store.test.mjs` y `tests/ui.test.mjs`. Chrome del proyecto soltado por Flor.

## Barra inferior: reaparición a 2,5 s · Amber · 2026-11-22 · PENDIENTE de revisión visual

- Pedido de Nico 22-nov vía Nova: la barra auto-ocultable debe reaparecer a los 2–3 s en vez de a los 0,5 s actuales. Valor elegido: **2500 ms** (`REAPARICION_MS` en `src/ui/nav-scroll.js`). Rama `fix/nav-reaparicion-2500ms` desde `origin/master` `2db834e`. Caché del service worker `ropa-v2-nav-reaparicion-2500ms-r15`. Sin tocar base de datos, datos reales ni fotos.
- Medición en navegador real (Chrome del proyecto, demo local, 390×844), repetida tras el hallazgo de Nova: con rueda real, tras el gesto la nav queda `oculta`, reaparece pasada la pausa de 2,5 s (`mostrarPorPausa`), sigue visible 3 s después (sin rebote) y mantiene la MISMA transición `0.21s, 0.21s`. Cronómetro interno de la medición ~2,0 s porque arranca después de la captura «oculta» (que consume ~0,5 s); el disparo real es a los 2500 ms de la última actividad, según `REAPARICION_MS`. 0 errores de consola. Tests de `nav-scroll.test.mjs` y `nav-reaparicion-ui.test.mjs` en verde.
- **Capturas del ciclo oculta→reaparecida** (demo local, `v2`: ocultar y capturar, esperar la pausa y capturar con la transición terminada, todo en un mismo bloque de Playwright): [390 claro oculta](capturas/2026-11-22/nav2500-v2-390-light-oculta.png) · [390 claro reaparecida](capturas/2026-11-22/nav2500-v2-390-light-reaparecida.png) · [390 oscuro oculta](capturas/2026-11-22/nav2500-v2-390-dark-oculta.png) · [390 oscuro reaparecida](capturas/2026-11-22/nav2500-v2-390-dark-reaparecida.png). Las parejas tienen md5 distinto (no son la misma imagen): la «oculta» no muestra barra y la «reaparecida» sí, con las 7 etiquetas, mint en la activa y sin neon en oscuro.
- Otras capturas de estado: [390 claro visible](capturas/2026-11-22/nav2500-390-light-visible.png) · [390 oscuro visible](capturas/2026-11-22/nav2500-390-dark-visible.png) · [320 claro visible](capturas/2026-11-22/nav2500-320-light-visible.png) · [320 oscuro visible](capturas/2026-11-22/nav2500-320-dark-visible.png). Las capturas v1 `nav2500-390-{light,dark}-{oculta,reaparecida}.png` se descartan: la etiquetada «reaparecida» era byte-idéntica a la «oculta» por un retardo entre medición y captura; NO usarlas como evidencia.
- Pruebas: `npm test` 75/75 y `npm run check` OK (53 archivos). Sin secretos ni datos de clientas en el diff (solo fixture sintético demo). **NO publicado**: a la espera de la revisión visual de Nico que exige la salvaguarda de cambios de barra/menú (22-nov). Nota de Chrome: Dino tenía una pestaña propia (`dino-integration-check`, puerto 8899) abierta en el mismo Chrome; no se tocó.
